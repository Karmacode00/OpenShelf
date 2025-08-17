import type { BookRepository } from '@/domain/repositories/BookRepository';

export function returnBookUseCase(repo: BookRepository) {
  return (p: { bookId: string; borrowerId: string }) => repo.returnBook(p.bookId, p.borrowerId);
}
