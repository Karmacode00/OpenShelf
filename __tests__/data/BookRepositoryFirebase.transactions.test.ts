import * as fs from 'firebase/firestore';

import { BookRepositoryFirebase } from '@/data/repositories/BookRepositoryFirebase';

type SnapData = Record<string, any>;
const makeSnap = (exists: boolean, data: SnapData = {}) => ({
  exists: () => exists,
  data: () => data,
});

describe('BookRepositoryFirebase • transacciones', () => {
  const repo = new BookRepositoryFirebase();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requestBook: crea loan "requested" y actualiza book a requested con currentLoanId', async () => {
    let capturedTx: any;

    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const bookRef = { _path: '/books/book1', id: 'book1' };
      const tx: any = {
        get: jest.fn(async (ref: any) => {
          if (ref._path === bookRef._path) {
            return makeSnap(true, { ownerId: 'ownerA', status: 'available' });
          }
          return makeSnap(false);
        }),
        set: jest.fn(async () => undefined),
        update: jest.fn(async () => undefined),
      };
      capturedTx = tx;
      return cb(tx);
    });

    await expect(repo.requestBook('book1', 'borrower1')).resolves.toBeUndefined();

    expect(capturedTx.set).toHaveBeenCalledTimes(1);
    const [loanRef, loanBody] = capturedTx.set.mock.calls[0];
    expect(loanRef._path).toMatch(/^\/books\/book1\/loans\/.+/);
    expect(loanBody).toEqual(
      expect.objectContaining({
        bookId: 'book1',
        ownerId: 'ownerA',
        borrowerId: 'borrower1',
        status: 'requested',
        active: true,
        createdAt: 'server-ts',
        updatedAt: 'server-ts',
        requestedAt: 'server-ts',
      }),
    );

    expect(capturedTx.update).toHaveBeenCalledTimes(1);
    const [bookRefArg, bookBody] = capturedTx.update.mock.calls[0];
    expect(bookRefArg._path).toBe('/books/book1');
    expect(bookBody).toEqual(
      expect.objectContaining({
        status: 'requested',
        borrowerId: 'borrower1',
        requestedAt: 'server-ts',
        updatedAt: 'server-ts',
        cancelledByBorrower: false,
        currentLoanId: loanRef.id,
      }),
    );
  });

  it('requestBook: estados inválidos → lanza error y no hace writes', async () => {
    let tx1: any;
    (fs.runTransaction as jest.Mock).mockImplementationOnce(async (_db, cb) => {
      const bookRef = { _path: '/books/miss', id: 'miss' };
      tx1 = {
        get: jest.fn(async (ref: any) =>
          ref._path === bookRef._path ? makeSnap(false) : makeSnap(false),
        ),
        set: jest.fn(),
        update: jest.fn(),
      };
      return cb(tx1);
    });

    await expect(repo.requestBook('miss', 'u1')).rejects.toThrow(/no existe/i);
    expect(tx1.set).not.toHaveBeenCalled();
    expect(tx1.update).not.toHaveBeenCalled();

    let tx2: any;
    (fs.runTransaction as jest.Mock).mockImplementationOnce(async (_db, cb) => {
      const bookRef = { _path: '/books/own', id: 'own' };
      tx2 = {
        get: jest.fn(async (ref: any) =>
          ref._path === bookRef._path
            ? makeSnap(true, { ownerId: 'u1', status: 'available' })
            : makeSnap(false),
        ),
        set: jest.fn(),
        update: jest.fn(),
      };
      return cb(tx2);
    });

    await expect(repo.requestBook('own', 'u1')).rejects.toThrow(/propio libro/i);
    expect(tx2.set).not.toHaveBeenCalled();
    expect(tx2.update).not.toHaveBeenCalled();

    let tx3: any;
    (fs.runTransaction as jest.Mock).mockImplementationOnce(async (_db, cb) => {
      const bookRef = { _path: '/books/busy', id: 'busy' };
      tx3 = {
        get: jest.fn(async (ref: any) =>
          ref._path === bookRef._path
            ? makeSnap(true, { ownerId: 'o1', status: 'loaned' })
            : makeSnap(false),
        ),
        set: jest.fn(),
        update: jest.fn(),
      };
      return cb(tx3);
    });

    await expect(repo.requestBook('busy', 'b1')).rejects.toThrow(/ya fue solicitado/i);
    expect(tx3.set).not.toHaveBeenCalled();
    expect(tx3.update).not.toHaveBeenCalled();
  });

  it('acceptRequest: loan pasa a loaned y book a loaned (mantiene borrowerId)', async () => {
    let capturedTx: any;

    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const bookRef = { _path: '/books/b1', id: 'b1' };
      const loanRef = { _path: '/books/b1/loans/loan1', id: 'loan1' };
      const tx: any = {
        get: jest.fn(async (ref: any) => {
          if (ref._path === bookRef._path) {
            return makeSnap(true, {
              ownerId: 'ownerX',
              status: 'requested',
              currentLoanId: 'loan1',
              borrowerId: 'borrowerY',
            });
          }
          if (ref._path === loanRef._path) {
            return makeSnap(true, { active: true, status: 'requested' });
          }
          return makeSnap(false);
        }),
        set: jest.fn(),
        update: jest.fn(),
      };
      capturedTx = tx;
      return cb(tx);
    });

    await expect(repo.acceptRequest('b1', 'ownerX')).resolves.toBeUndefined();

    expect(capturedTx.update).toHaveBeenCalledTimes(2);

    const [loanRefArg, loanBody] = capturedTx.update.mock.calls[0];
    expect(loanRefArg._path).toBe('/books/b1/loans/loan1');
    expect(loanBody).toEqual(
      expect.objectContaining({
        status: 'loaned',
        loanedAt: 'server-ts',
        acceptedAt: 'server-ts',
        updatedAt: 'server-ts',
      }),
    );

    const [bookRefArg, bookBody] = capturedTx.update.mock.calls[1];
    expect(bookRefArg._path).toBe('/books/b1');
    expect(bookBody).toEqual(
      expect.objectContaining({
        status: 'loaned',
        borrowerId: 'borrowerY',
        updatedAt: 'server-ts',
      }),
    );
  });

  it('rejectRequest: loan → rejected/active:false; book → available & limpia borrower', async () => {
    let capturedTx: any;

    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const bookRef = { _path: '/books/b2', id: 'b2' };
      const loanRef = { _path: '/books/b2/loans/loanZ', id: 'loanZ' };

      const tx: any = {
        get: jest.fn(async (ref: any) => {
          if (ref._path === bookRef._path) {
            return makeSnap(true, {
              ownerId: 'owner1',
              status: 'requested',
              currentLoanId: 'loanZ',
            });
          }
          if (ref._path === loanRef._path) return makeSnap(true, {});
          return makeSnap(false);
        }),
        update: jest.fn(),
        set: jest.fn(),
      };
      capturedTx = tx;
      return cb(tx);
    });

    await expect(repo.rejectRequest('b2', 'owner1')).resolves.toBeUndefined();

    expect(capturedTx.update).toHaveBeenCalledTimes(2);

    const [loanRefArg, loanBody] = capturedTx.update.mock.calls[0];
    expect(loanRefArg._path).toBe('/books/b2/loans/loanZ');
    expect(loanBody).toEqual(
      expect.objectContaining({
        status: 'rejected',
        active: false,
        rejectedAt: 'server-ts',
        updatedAt: 'server-ts',
      }),
    );

    const [bookRefArg, bookBody] = capturedTx.update.mock.calls[1];
    expect(bookRefArg._path).toBe('/books/b2');
    expect(bookBody).toEqual(
      expect.objectContaining({
        status: 'available',
        borrowerId: null,
        requestedAt: null,
        currentLoanId: null,
        updatedAt: 'server-ts',
      }),
    );
  });

  it('cancelRequest: borrower correcto cancela → loan cancelled/active:false; book available+flags', async () => {
    let capturedTx: any;

    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const bookRef = { _path: '/books/c1', id: 'c1' };
      const loanRef = { _path: '/books/c1/loans/loanA', id: 'loanA' };

      const tx: any = {
        get: jest.fn(async (ref: any) => {
          if (ref._path === bookRef._path)
            return makeSnap(true, {
              status: 'requested',
              borrowerId: 'borrowMe',
              currentLoanId: 'loanA',
            });
          if (ref._path === loanRef._path) return makeSnap(true, {});
          return makeSnap(false);
        }),
        update: jest.fn(),
        set: jest.fn(),
      };
      capturedTx = tx;
      return cb(tx);
    });

    await expect(repo.cancelRequest('c1', 'borrowMe')).resolves.toBeUndefined();

    expect(capturedTx.update).toHaveBeenCalledTimes(2);

    const [loanRefArg, loanBody] = capturedTx.update.mock.calls[0];
    expect(loanRefArg._path).toBe('/books/c1/loans/loanA');
    expect(loanBody).toEqual(
      expect.objectContaining({
        status: 'cancelled',
        active: false,
        cancelledAt: 'server-ts',
        updatedAt: 'server-ts',
      }),
    );

    const [bookRefArg, bookBody] = capturedTx.update.mock.calls[1];
    expect(bookRefArg._path).toBe('/books/c1');
    expect(bookBody).toEqual(
      expect.objectContaining({
        status: 'available',
        borrowerId: null,
        requestedAt: null,
        currentLoanId: null,
        cancelledByBorrower: true,
        updatedAt: 'server-ts',
      }),
    );
  });

  it('returnBook: borrower correcto devuelve → loan returned/active:false; book available y limpia', async () => {
    let capturedTx: any;

    (fs.runTransaction as jest.Mock).mockImplementation(async (_db, cb) => {
      const bookRef = { _path: '/books/r1', id: 'r1' };
      const loanRef = { _path: '/books/r1/loans/loanR', id: 'loanR' };

      const tx: any = {
        get: jest.fn(async (ref: any) => {
          if (ref._path === bookRef._path)
            return makeSnap(true, {
              status: 'loaned',
              borrowerId: 'borrowZ',
              currentLoanId: 'loanR',
            });
          if (ref._path === loanRef._path) return makeSnap(true, {});
          return makeSnap(false);
        }),
        update: jest.fn(),
        set: jest.fn(),
      };
      capturedTx = tx;
      return cb(tx);
    });

    await expect(repo.returnBook('r1', 'borrowZ')).resolves.toBeUndefined();

    expect(capturedTx.update).toHaveBeenCalledTimes(2);

    const [loanRefArg, loanBody] = capturedTx.update.mock.calls[0];
    expect(loanRefArg._path).toBe('/books/r1/loans/loanR');
    expect(loanBody).toEqual(
      expect.objectContaining({
        status: 'returned',
        active: false,
        returnedAt: 'server-ts',
        updatedAt: 'server-ts',
      }),
    );

    const [bookRefArg, bookBody] = capturedTx.update.mock.calls[1];
    expect(bookRefArg._path).toBe('/books/r1');
    expect(bookBody).toEqual(
      expect.objectContaining({
        status: 'available',
        borrowerId: null,
        requestedAt: null,
        currentLoanId: null,
        updatedAt: 'server-ts',
      }),
    );
  });
});
