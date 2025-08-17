import type { Book } from '@/domain/entities/Book';
import type { BookRepository } from '@/domain/repositories/BookRepository';

export function listMyLoansUseCase(repo: BookRepository) {
  return (borrowerId: string): Promise<Book[]> => repo.getByBorrower(borrowerId);
}
