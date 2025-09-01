import * as fs from 'firebase/firestore';
import * as st from 'firebase/storage';
import { geohashForLocation } from 'geofire-common';

import { BookRepositoryFirebase } from '@/data/repositories/BookRepositoryFirebase';

describe('BookRepositoryFirebase.addBook', () => {
  const repo = new BookRepositoryFirebase();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn().mockResolvedValue({
      blob: () => Promise.resolve('blob-data'),
    });
  });

  it('sube imagen, usa ubicación del usuario y crea el libro', async () => {
    (fs.doc as jest.Mock).mockImplementation((_db, col, uid) => `/${col}/${uid}`);
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ location: { latitude: -33.45, longitude: -70.67, formattedAddress: 'SCL' } }),
    });

    (st.ref as jest.Mock).mockImplementation((_storage, path) => ({ _path: path }));
    (st.uploadBytes as jest.Mock).mockResolvedValue(undefined);
    (st.getDownloadURL as jest.Mock).mockResolvedValue(
      'https://firebasestorage.googleapis.com/v0/b/my/o/books%2Fowner1%2Fimg.jpg?alt=media',
    );
    (geohashForLocation as jest.Mock).mockReturnValue('hash123');
    (fs.collection as jest.Mock).mockImplementation((_db, col) => `/${col}`);
    (fs.addDoc as jest.Mock).mockResolvedValue({ id: 'newBookId' });

    const input = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      imageUri: 'file://local/pic.jpg',
      ownerId: 'owner1',
    };

    const book = await repo.addBook(input);

    expect(st.ref).toHaveBeenCalledWith(
      { __brand: 'storage' },
      expect.stringMatching(/^books\/owner1\/.+\.jpg$/),
    );
    expect(st.uploadBytes).toHaveBeenCalledWith(expect.any(Object), 'blob-data');
    expect(st.getDownloadURL).toHaveBeenCalled();

    expect(fs.collection).toHaveBeenCalledWith({ __brand: 'db' }, 'books');
    expect(fs.addDoc).toHaveBeenCalledWith(
      '/books',
      expect.objectContaining({
        title: 'Clean Code',
        author: 'Robert C. Martin',
        ownerId: 'owner1',
        status: 'available',
        imageUrl: expect.stringContaining('books%2Fowner1'),
        geohash: 'hash123',
        location: { latitude: -33.45, longitude: -70.67, formattedAddress: 'SCL' },
        createdAt: 'server-ts',
      }),
    );

    expect(book).toMatchObject({
      id: 'newBookId',
      title: 'Clean Code',
      ownerId: 'owner1',
      status: 'available',
      geohash: 'hash123',
    });
  });

  it('lanza error si no hay ubicación del usuario', async () => {
    (fs.getDoc as jest.Mock).mockResolvedValue({ exists: () => true, data: () => ({}) });

    await expect(
      repo.addBook({ title: 'X', author: 'Y', imageUri: 'file://x', ownerId: 'o1' }),
    ).rejects.toThrow(/No se pudo obtener la ubicación/i);
  });

  it('genera searchTokens normalizados y únicos (descarta tokens de 1 char)', async () => {
    (fs.doc as jest.Mock).mockImplementation((_db, col, uid) => `/${col}/${uid}`);
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ location: { latitude: -33.45, longitude: -70.67, formattedAddress: 'SCL' } }),
    });

    (st.ref as jest.Mock).mockImplementation((_s, path) => ({ _path: path }));
    (st.uploadBytes as jest.Mock).mockResolvedValue(undefined);
    (st.getDownloadURL as jest.Mock).mockResolvedValue(
      'https://firebasestorage.googleapis.com/v0/b/app/o/books%2Fowner1%2Fimg.jpg?alt=media',
    );

    (geohashForLocation as jest.Mock).mockReturnValue('hashXYZ');
    (fs.collection as jest.Mock).mockImplementation((_db, col) => `/${col}`);

    const addDocSpy = (fs.addDoc as jest.Mock).mockResolvedValue({ id: 'nb1' });

    await repo.addBook({
      title: 'Códigó ¡Limpio! A',
      author: 'R. C. Martín',
      imageUri: 'file://local.jpg',
      ownerId: 'owner1',
    });

    const [, body] = addDocSpy.mock.calls[0];

    expect(body.searchTokens).toEqual(expect.arrayContaining(['codigo', 'limpio', 'martin']));
    expect(body.searchTokens).toEqual(expect.not.arrayContaining(['a', 'r', 'c']));

    expect(new Set(body.searchTokens).size).toBe(body.searchTokens.length);
    expect(body.searchTokens.length).toBeLessThanOrEqual(10);
  });
});
