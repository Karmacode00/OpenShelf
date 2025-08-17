import type { BookRepository } from '@/domain/repositories/BookRepository';

export function cancelRequestUseCase(repo: BookRepository) {
  return (p: { bookId: string; borrowerId: string }) => repo.cancelRequest(p.bookId, p.borrowerId);
}
