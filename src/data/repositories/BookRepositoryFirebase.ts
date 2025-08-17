import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit as qlimit,
  runTransaction,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import type { Book } from '@/domain/entities/Book';
import type { BookRepository, AddBookInput } from '@/domain/repositories/BookRepository';
import { db, storage } from '@/services/firebase';

function toTokens(...vals: string[]) {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '') // sin acentos
      .replace(/[^a-z0-9\s]/g, ' ') // solo letras/números
      .split(/\s+/)
      .filter(Boolean);

  // tokens únicos, descarta muy cortos (1 char) para menos ruido
  const set = new Set<string>();
  vals.flatMap(norm).forEach((t) => {
    if (t.length >= 2) set.add(t);
  });
  return Array.from(set).slice(0, 10);
}

function tokensFromQuery(q: string) {
  return toTokens(q);
}

export class BookRepositoryFirebase implements BookRepository {
  async addBook({ title, author, imageUri, ownerId }: AddBookInput): Promise<Book> {
    const fileName = `${Date.now()}.jpg`;
    const path = `books/${ownerId}/${fileName}`;

    const res = await fetch(imageUri);
    const blob = await res.blob();

    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, blob);
    const imageUrl = await getDownloadURL(fileRef);
    const tokens = toTokens(title, author);
    const status = 'available';

    const docRef = await addDoc(collection(db, 'books'), {
      title,
      author,
      imageUrl,
      ownerId,
      searchTokens: tokens,
      status,
      borrowerId: null,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      title,
      author,
      imageUrl,
      ownerId,
      status,
    };
  }

  async getByOwner(ownerId: string): Promise<Book[]> {
    const q = query(
      collection(db, 'books'),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);

    if (snap.empty) console.log('Empty snapshot');

    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title,
        author: data.author,
        imageUrl: data.imageUrl,
        ownerId: data.ownerId,
        status: data.status ?? 'available',
        borrowerId: data.borrowerId ?? null,
        createdAt: data.createdAt?.toDate?.() ?? undefined,
      } as Book;
    });
  }

  async searchPublic(queryText: string, limitNum = 30): Promise<Book[]> {
    const tokens = tokensFromQuery(queryText);
    if (tokens.length === 0) return [];

    const qRef = query(
      collection(db, 'books'),
      where('searchTokens', 'array-contains-any', tokens),
      qlimit(limitNum),
    );
    const snap = await getDocs(qRef);

    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title,
        author: data.author,
        imageUrl: data.imageUrl,
        ownerId: data.ownerId,
        status: data.status ?? 'available',
        borrowerId: data.borrowerId ?? null,
        createdAt: data.createdAt?.toDate?.() ?? undefined,
      } as Book;
    });
  }

  async requestBook(bookId: string, requesterId: string): Promise<void> {
    const ref = doc(db, 'books', bookId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Libro no existe');

      const data = snap.data() as any;

      if (data.ownerId === requesterId) {
        throw new Error('No puedes solicitar tu propio libro');
      }
      if (data.status !== 'available') {
        throw new Error('El libro ya fue solicitado');
      }

      tx.update(ref, {
        status: 'requested',
        borrowerId: requesterId,
        requestedAt: serverTimestamp(),
      });
    });
  }

  async getByBorrower(borrowerId: string): Promise<Book[]> {
    const qRef = query(collection(db, 'books'), where('borrowerId', '==', borrowerId));
    const snap = await getDocs(qRef);
    return snap.docs
      .map((d) => {
        const x = d.data() as any;
        return {
          id: d.id,
          title: x.title,
          author: x.author,
          imageUrl: x.imageUrl,
          ownerId: x.ownerId,
          status: x.status,
          borrowerId: x.borrowerId,
          createdAt: x.createdAt?.toDate?.(),
        } as Book;
      })
      .filter((b) => b.status === 'requested' || b.status === 'loaned');
  }

  async cancelRequest(bookId: string, borrowerId: string): Promise<void> {
    const ref = doc(db, 'books', bookId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Libro no existe');
      const data = snap.data() as any;

      if (data.borrowerId !== borrowerId) throw new Error('No eres el solicitante');
      if (data.status !== 'requested') throw new Error('El libro no está solicitado');

      tx.update(ref, {
        status: 'available',
        borrowerId: null,
        requestedAt: null,
        updatedAt: serverTimestamp(),
      });
    });
  }

  async returnBook(bookId: string, borrowerId: string): Promise<void> {
    const ref = doc(db, 'books', bookId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Libro no existe');
      const data = snap.data() as any;

      if (data.borrowerId !== borrowerId) throw new Error('No eres el prestatario');
      if (data.status !== 'loaned') throw new Error('El libro no está prestado');

      tx.update(ref, {
        status: 'available',
        borrowerId: null,
        returnedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  }
}
