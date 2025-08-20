import type { BookRepository } from '@/domain/repositories/BookRepository';

export function rejectRequestUseCase(repo: BookRepository) {
  return (p: { bookId: string; ownerId: string }) => repo.rejectRequest(p.bookId, p.ownerId);
}
