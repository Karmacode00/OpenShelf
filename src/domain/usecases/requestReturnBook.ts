import type { BookRepository } from '@/domain/repositories/BookRepository';

export function requestReturnBookUseCase(repo: BookRepository) {
  return (p: { bookId: string; borrowerId: string }) => repo.requestReturn(p.bookId, p.borrowerId);
}
