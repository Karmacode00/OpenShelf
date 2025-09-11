import type { BookRepository } from '@/domain/repositories/BookRepository';

export function rejectReturnUseCase(repo: BookRepository) {
  return (p: { bookId: string; ownerId: string }) => repo.rejectReturn(p.bookId, p.ownerId);
}
