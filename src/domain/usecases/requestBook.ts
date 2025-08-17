import type { BookRepository } from '@/domain/repositories/BookRepository';

export function requestBookUseCase(repo: BookRepository) {
  return (params: { bookId: string; requesterId: string }) =>
    repo.requestBook(params.bookId, params.requesterId);
}
