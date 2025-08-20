import type { BookRepository } from '@/domain/repositories/BookRepository';

export function acceptRequestUseCase(repo: BookRepository) {
  return (p: { bookId: string; ownerId: string }) => repo.acceptRequest(p.bookId, p.ownerId);
}
