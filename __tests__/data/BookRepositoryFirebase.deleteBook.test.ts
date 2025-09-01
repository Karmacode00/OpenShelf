import * as fs from 'firebase/firestore';
import * as st from 'firebase/storage';

import { BookRepositoryFirebase } from '@/data/repositories/BookRepositoryFirebase';

const makeSnap = (exists: boolean, data: any = {}) => ({ exists: () => exists, data: () => data });

describe('BookRepositoryFirebase.deleteBook', () => {
  const repo = new BookRepositoryFirebase();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('elimina doc y luego borra la imagen del Storage (URL https)', async () => {
    (fs.doc as jest.Mock).mockReturnValue('/books/book1');
    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const tx = {
        get: jest.fn(async () =>
          makeSnap(true, {
            ownerId: 'owner1',
            status: 'available',
            imageUrl:
              'https://firebasestorage.googleapis.com/v0/b/app/o/books%2Fowner1%2Ffile.jpg?alt=media',
          }),
        ),
        delete: jest.fn(),
      };
      return cb(tx);
    });

    (st.ref as jest.Mock).mockImplementation((_storage, path) => ({ _path: path }));
    (st.deleteObject as jest.Mock).mockResolvedValue(undefined);

    await expect(repo.deleteBook('book1', 'owner1')).resolves.toBeUndefined();

    expect(st.ref).toHaveBeenCalledWith({ __brand: 'storage' }, 'books/owner1/file.jpg');
    expect(st.deleteObject).toHaveBeenCalledWith({ _path: 'books/owner1/file.jpg' });
  });

  it('rechaza si no eres el dueño o si el estado != available', async () => {
    (fs.doc as jest.Mock).mockReturnValue('/books/book1');

    // Not owner
    (fs.runTransaction as jest.Mock).mockImplementationOnce(async (_db, cb) => {
      const tx = {
        get: jest.fn(async () => makeSnap(true, { ownerId: 'other', status: 'available' })),
        delete: jest.fn(),
      };
      return cb(tx);
    });
    await expect(repo.deleteBook('book1', 'owner1')).rejects.toThrow(/No eres el dueño/i);

    // Not available
    (fs.runTransaction as jest.Mock).mockImplementationOnce(async (_db, cb) => {
      const tx = {
        get: jest.fn(async () => makeSnap(true, { ownerId: 'owner1', status: 'loaned' })),
        delete: jest.fn(),
      };
      return cb(tx);
    });
    await expect(repo.deleteBook('book1', 'owner1')).rejects.toThrow(/no está disponible/i);
  });

  it('usa path de tipo gs://bucket/...', async () => {
    (fs.doc as jest.Mock).mockReturnValue('/books/b1');
    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const tx = {
        get: jest.fn(async () =>
          makeSnap(true, {
            ownerId: 'owner1',
            status: 'available',
            imageUrl: 'gs://my-bucket/books/owner1/file.jpg',
          }),
        ),
        delete: jest.fn(),
      };
      return cb(tx);
    });

    (st.ref as jest.Mock).mockImplementation((_s, path) => ({ _path: path }));
    (st.deleteObject as jest.Mock).mockResolvedValue(undefined);

    await expect(repo.deleteBook('b1', 'owner1')).resolves.toBeUndefined();
    expect(st.ref).toHaveBeenCalledWith({ __brand: 'storage' }, 'my-bucket/books/owner1/file.jpg');
  });

  it('si imageUrl inválido → no llama deleteObject', async () => {
    (fs.doc as jest.Mock).mockReturnValue('/books/b2');
    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const tx = {
        get: jest.fn(async () =>
          makeSnap(true, {
            ownerId: 'owner1',
            status: 'available',
            imageUrl: 'notaurl-%%%^^^',
          }),
        ),
        delete: jest.fn(),
      };
      return cb(tx);
    });

    await expect(repo.deleteBook('b2', 'owner1')).resolves.toBeUndefined();
    expect(st.deleteObject).not.toHaveBeenCalled();
  });

  it('si deleteObject lanza → se captura y hace console.warn', async () => {
    (fs.doc as jest.Mock).mockReturnValue('/books/b3');
    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const tx = {
        get: jest.fn(async () =>
          makeSnap(true, {
            ownerId: 'owner1',
            status: 'available',
            imageUrl:
              'https://firebasestorage.googleapis.com/v0/b/app/o/books%2Fowner1%2Fevil.jpg?alt=media',
          }),
        ),
        delete: jest.fn(),
      };
      return cb(tx);
    });

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (st.ref as jest.Mock).mockImplementation((_s, path) => ({ _path: path }));
    (st.deleteObject as jest.Mock).mockRejectedValue(new Error('permiso denegado'));

    await expect(repo.deleteBook('b3', 'owner1')).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/No se pudo eliminar la imagen del Storage/),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});
