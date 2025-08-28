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
  getDoc,
  startAt,
  endAt,
  documentId,
  collectionGroup,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

import type { Book } from '@/domain/entities/Book';
import { Loan } from '@/domain/entities/Loan';
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

function distKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  return distanceBetween([a.latitude, a.longitude], [b.latitude, b.longitude]);
}

function inferStoragePathFromUrl(url: string): string | null {
  try {
    if (url.startsWith('gs://')) {
      const [, , ...rest] = url.split('/');
      return rest.join('/') || null;
    }
    const u = new URL(url);
    const m = u.pathname.match(/\/o\/([^/]+)$/) || u.pathname.match(/\/o\/([^?]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function loanDocRef(bookId: string, loanId?: string) {
  const coll = collection(db, 'books', bookId, 'loans');
  return loanId ? doc(coll, loanId) : doc(coll);
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

    const userSnap = await getDoc(doc(db, 'users', ownerId));
    const userLoc = userSnap.exists() ? (userSnap.data() as any).location : null;

    let location: {
      latitude: number;
      longitude: number;
      formattedAddress: string;
    };
    let geohash: string;

    if (userLoc?.latitude != null && userLoc?.longitude != null) {
      location = {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude,
        formattedAddress: userLoc.formattedAddress,
      };
      geohash = geohashForLocation([location.latitude, location.longitude]);
    } else {
      throw new Error(
        'No se pudo obtener la ubicación del usuario. No se puede agregar el libro sin ubicación.',
      );
    }

    const docRef = await addDoc(collection(db, 'books'), {
      title,
      author,
      imageUrl,
      ownerId,
      searchTokens: tokens,
      status,
      borrowerId: null,
      location,
      geohash,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      title,
      author,
      imageUrl,
      ownerId,
      status,
      location,
      geohash: geohash ?? '',
    };
  }

  async deleteBook(bookId: string, ownerId: string): Promise<void> {
    const refDoc = doc(db, 'books', bookId);

    let imageUrl: string | undefined;

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(refDoc);
      if (!snap.exists()) throw new Error('Libro no existe');

      const data = snap.data() as {
        ownerId: string;
        status: 'available' | 'requested' | 'loaned';
        imageUrl?: string;
      };

      if (data.ownerId !== ownerId) throw new Error('No eres el dueño');
      if (data.status !== 'available') throw new Error('El libro no está disponible');

      imageUrl = data.imageUrl;
      tx.delete(refDoc);
    });

    if (imageUrl) {
      try {
        const path = inferStoragePathFromUrl(imageUrl);
        if (path) {
          await deleteObject(ref(storage, path));
        }
      } catch (err) {
        console.warn('No se pudo eliminar la imagen del Storage:', err);
      }
    }
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

  async searchNearbyPublic(params: {
    center: { latitude: number; longitude: number };
    radiusKm: number;
    limitNum?: number;
    excludeOwnerId?: string;
    showBorrowed?: boolean;
    queryText?: string;
  }): Promise<(Book & { distanceKm: number })[]> {
    const {
      center: { latitude, longitude },
      radiusKm,
      limitNum = 50,
      excludeOwnerId,
      showBorrowed = false,
      queryText,
    } = params;

    const tokens = queryText ? tokensFromQuery(queryText) : [];
    const useText = tokens.length > 0;

    const bounds = geohashQueryBounds([latitude, longitude], radiusKm * 1000);
    const coll = collection(db, 'books');

    const queries = bounds.map(([start, end]) => {
      let qRef = query(coll, orderBy('geohash'), startAt(start), endAt(end));

      if (!showBorrowed) {
        qRef = query(qRef, where('status', 'in', ['available', 'requested']));
      }

      if (useText) {
        qRef = query(qRef, where('searchTokens', 'array-contains-any', tokens));
      }

      return qRef;
    });

    const snaps = await Promise.all(queries.map((qRef) => getDocs(qRef)));

    const all = snaps.flatMap((snap) =>
      snap.docs.map((d) => {
        const x = d.data() as any;
        const distance = distKm(
          { latitude: x.location.latitude, longitude: x.location.longitude },
          { latitude, longitude },
        );
        return {
          id: d.id,
          title: x.title,
          author: x.author,
          imageUrl: x.imageUrl,
          ownerId: x.ownerId,
          status: x.status,
          borrowerId: x.borrowerId ?? null,
          createdAt: x.createdAt?.toDate?.(),
          distanceKm: distance,
          location: x.location,
        } as Book & { distanceKm: number };
      }),
    );

    const seen = new Set<string>();
    const filtered = all
      .filter((b) => b.distanceKm <= radiusKm)
      .filter((b) => (excludeOwnerId ? b.ownerId !== excludeOwnerId : true))
      .filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return filtered.slice(0, limitNum);
  }

  async requestBook(bookId: string, requesterId: string): Promise<void> {
    const ref = doc(db, 'books', bookId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Libro no existe');

      const data = snap.data() as any;
      if (data.ownerId === requesterId) throw new Error('No puedes solicitar tu propio libro');
      if (data.status !== 'available') throw new Error('El libro ya fue solicitado');

      const loanRef = loanDocRef(bookId);
      tx.set(loanRef, {
        bookId,
        ownerId: data.ownerId,
        borrowerId: requesterId,
        status: 'requested',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requestedAt: serverTimestamp(),
      });

      tx.update(ref, {
        status: 'requested',
        borrowerId: requesterId,
        requestedAt: serverTimestamp(),
        currentLoanId: loanRef.id,
        updatedAt: serverTimestamp(),
        cancelledByBorrower: false,
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

  async getLoansByBorrower(
    borrowerId: string,
    opts: { activeOnly?: boolean; limit?: number } = {},
  ): Promise<(Loan & { book: Pick<Book, 'id' | 'title' | 'author' | 'imageUrl' | 'status'> })[]> {
    const { activeOnly = false, limit: lim } = opts;

    let qRef = query(
      collectionGroup(db, 'loans'),
      where('borrowerId', '==', borrowerId),
      orderBy('createdAt', 'desc'),
    );
    if (activeOnly) qRef = query(qRef, where('active', '==', true));
    if (lim && Number.isFinite(lim)) qRef = query(qRef, qlimit(lim!));

    const snap = await getDocs(qRef);
    if (snap.empty) return [];

    const loans: Loan[] = snap.docs.map((d) => {
      const x = d.data() as any;
      const toDate = (t?: any) => (t?.toDate?.() ? t.toDate() : undefined);
      return {
        id: d.id,
        bookId: x.bookId,
        ownerId: x.ownerId,
        borrowerId: x.borrowerId,
        status: x.status,
        active: !!x.active,
        createdAt: toDate(x.createdAt),
        updatedAt: toDate(x.updatedAt),
        requestedAt: toDate(x.requestedAt),
        acceptedAt: toDate(x.acceptedAt),
        rejectedAt: toDate(x.rejectedAt),
        cancelledAt: toDate(x.cancelledAt),
        loanedAt: toDate(x.loanedAt),
        returnedAt: toDate(x.returnedAt),
        dueDate: toDate(x.dueDate),
      };
    });

    const ids = Array.from(new Set(loans.map((l) => l.bookId)));
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

    const bookMap = new Map<
      string,
      Pick<Book, 'id' | 'title' | 'author' | 'imageUrl' | 'status'>
    >();
    for (const ch of chunks) {
      const booksSnap = await getDocs(
        query(collection(db, 'books'), where(documentId(), 'in', ch)),
      );
      console.log(`Fetched books chunk, got ${booksSnap.size} books for ${ch.length} ids`);
      booksSnap.docs.forEach((b) => {
        const x = b.data() as any;
        bookMap.set(b.id, {
          id: b.id,
          title: x.title,
          author: x.author,
          imageUrl: x.imageUrl,
          status: x.status ?? 'available',
        });
      });
    }
    console.log('Total books fetched:', bookMap.size);
    const finalLoans = loans.map((l) => ({
      ...l,
      book: bookMap.get(l.bookId) ?? {
        id: l.bookId,
        title: '(eliminado)',
        author: '',
        imageUrl: '',
        status: 'available',
      },
    }));
    console.log('Final loans:', finalLoans);
    return finalLoans;
  }

  async cancelRequest(bookId: string, borrowerId: string): Promise<void> {
    const bookRef = doc(db, 'books', bookId);

    await runTransaction(db, async (tx) => {
      const bookSnap = await tx.get(bookRef);
      if (!bookSnap.exists()) throw new Error('Libro no existe');
      const b = bookSnap.data() as any;

      if (b.status !== 'requested') throw new Error('El libro no está solicitado');
      if (b.borrowerId !== borrowerId) throw new Error('No eres el solicitante');
      if (!b.currentLoanId) throw new Error('No hay solicitud activa');

      const loanRef = loanDocRef(bookId, b.currentLoanId);
      const loanSnap = await tx.get(loanRef);
      if (!loanSnap.exists()) throw new Error('Solicitud no encontrada');

      tx.update(loanRef, {
        status: 'cancelled',
        active: false,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.update(bookRef, {
        status: 'available',
        borrowerId: null,
        requestedAt: null,
        currentLoanId: null,
        cancelledByBorrower: true,
        updatedAt: serverTimestamp(),
      });
    });
  }

  async returnBook(bookId: string, borrowerId: string): Promise<void> {
    const bookRef = doc(db, 'books', bookId);

    await runTransaction(db, async (tx) => {
      const bookSnap = await tx.get(bookRef);
      if (!bookSnap.exists()) throw new Error('Libro no existe');
      const b = bookSnap.data() as any;

      if (b.status !== 'loaned') throw new Error('El libro no está prestado');
      if (b.borrowerId !== borrowerId) throw new Error('No eres el prestatario');
      if (!b.currentLoanId) throw new Error('No hay préstamo activo');

      const loanRef = loanDocRef(bookId, b.currentLoanId);
      const loanSnap = await tx.get(loanRef);
      if (!loanSnap.exists()) throw new Error('Préstamo no encontrado');

      tx.update(loanRef, {
        status: 'returned',
        active: false,
        returnedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.update(bookRef, {
        status: 'available',
        borrowerId: null,
        requestedAt: null,
        currentLoanId: null,
        updatedAt: serverTimestamp(),
      });
    });
  }

  async acceptRequest(bookId: string, ownerId: string): Promise<void> {
    const bookRef = doc(db, 'books', bookId);

    await runTransaction(db, async (tx) => {
      const bookSnap = await tx.get(bookRef);
      if (!bookSnap.exists()) throw new Error('Libro no existe');
      const b = bookSnap.data() as any;

      if (b.ownerId !== ownerId) throw new Error('No eres el dueño');
      if (b.status !== 'requested') throw new Error('No está solicitado');
      if (!b.currentLoanId) throw new Error('No hay solicitud activa');
      if (!b.borrowerId) throw new Error('No hay solicitante para aprobar');

      const loanRef = loanDocRef(bookId, b.currentLoanId);
      const loanSnap = await tx.get(loanRef);
      if (!loanSnap.exists()) throw new Error('Solicitud no encontrada');
      const l = loanSnap.data() as any;
      if (!l.active || l.status !== 'requested') throw new Error('Solicitud no está pendiente');

      tx.update(loanRef, {
        status: 'loaned',
        loanedAt: serverTimestamp(),
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.update(bookRef, {
        status: 'loaned',
        borrowerId: b.borrowerId,
        updatedAt: serverTimestamp(),
      });
    });
  }

  async rejectRequest(bookId: string, ownerId: string): Promise<void> {
    const bookRef = doc(db, 'books', bookId);

    await runTransaction(db, async (tx) => {
      const bookSnap = await tx.get(bookRef);
      if (!bookSnap.exists()) throw new Error('Libro no existe');
      const b = bookSnap.data() as any;

      if (b.ownerId !== ownerId) throw new Error('No eres el dueño');
      if (b.status !== 'requested') throw new Error('No está solicitado');
      if (!b.currentLoanId) throw new Error('No hay solicitud activa');

      const loanRef = loanDocRef(bookId, b.currentLoanId);
      const loanSnap = await tx.get(loanRef);
      if (!loanSnap.exists()) throw new Error('Solicitud no encontrada');

      tx.update(loanRef, {
        status: 'rejected',
        active: false,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.update(bookRef, {
        status: 'available',
        borrowerId: null,
        requestedAt: null,
        currentLoanId: null,
        updatedAt: serverTimestamp(),
      });
    });
  }
}
