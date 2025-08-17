import type { Book } from '../entities/Book';
import type { BookRepository } from '../repositories/BookRepository';

export function listMyBooksUseCase(repo: BookRepository) {
  return async (ownerId: string): Promise<Book[]> => repo.getByOwner(ownerId);
}
