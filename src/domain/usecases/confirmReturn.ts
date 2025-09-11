import type { BookRepository } from '@/domain/repositories/BookRepository';

export function confirmReturnUseCase(repo: BookRepository) {
  return (p: { bookId: string; ownerId: string }) => repo.confirmReturn(p.bookId, p.ownerId);
}
