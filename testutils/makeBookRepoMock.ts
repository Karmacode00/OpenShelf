import type { BookRepository } from '@/domain/repositories/BookRepository';

export function makeBookRepoMock(overrides?: Partial<jest.Mocked<BookRepository>>) {
  const repo: jest.Mocked<BookRepository> = {
    addBook: jest.fn(),
    deleteBook: jest.fn(),
    getByOwner: jest.fn(),
    searchNearbyPublic: jest.fn(),
    requestBook: jest.fn().mockResolvedValue(undefined),
    getByBorrower: jest.fn(),
    getLoansByBorrower: jest.fn(),
    cancelRequest: jest.fn(),
    returnBook: jest.fn(),
    acceptRequest: jest.fn(),
    rejectRequest: jest.fn(),
  };

  // Defaults razonables para evitar undefined en tests de ejemplo
  repo.getByOwner.mockResolvedValue([]);
  repo.getByBorrower.mockResolvedValue([]);
  repo.getLoansByBorrower.mockResolvedValue([]);
  repo.searchNearbyPublic.mockResolvedValue([]);

  return Object.assign(repo, overrides);
}
