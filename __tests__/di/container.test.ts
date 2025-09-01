/**
 * Verifica que getBookRepository/getUserRepository:
 *  - devuelven singleton (misma instancia en múltiples llamadas)
 *  - instancian la clase concreta correcta (una sola vez)
 *
 * Usamos isolateModules + doMock para controlar las clases concretas.
 */

describe('DI container wiring', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('getBookRepository retorna singleton e instancia BookRepositoryFirebase una sola vez', () => {
    jest.isolateModules(() => {
      const BookRepoCtor = jest.fn(() => ({ __brand: 'bookRepo' }));
      jest.doMock('@/data/repositories/BookRepositoryFirebase', () => ({
        BookRepositoryFirebase: BookRepoCtor,
      }));

      const { getBookRepository } = require('@/di/container');

      const a = getBookRepository();
      const b = getBookRepository();

      expect(a).toBe(b);
      expect(BookRepoCtor).toHaveBeenCalledTimes(1);
      expect(a).toEqual({ __brand: 'bookRepo' });
    });
  });

  it('getUserRepository retorna singleton e instancia UserRepositoryFirebase una sola vez', () => {
    jest.isolateModules(() => {
      const UserRepoCtor = jest.fn(() => ({ __brand: 'userRepo' }));
      jest.doMock('@/data/repositories/UserRepositoryFirebase', () => ({
        UserRepositoryFirebase: UserRepoCtor,
      }));

      const { getUserRepository } = require('@/di/container');

      const a = getUserRepository();
      const b = getUserRepository();

      expect(a).toBe(b);
      expect(UserRepoCtor).toHaveBeenCalledTimes(1);
      expect(a).toEqual({ __brand: 'userRepo' });
    });
  });
});
