import type { BookRepository } from '../repositories/BookRepository';

export function deleteBookUseCase(repo: BookRepository) {
  return async (bookId: string, ownerId: string): Promise<void> => repo.deleteBook(bookId, ownerId);
}
