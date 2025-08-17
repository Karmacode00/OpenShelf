import type { Book } from '@/domain/entities/Book';
import type { BookRepository } from '@/domain/repositories/BookRepository';

export function searchBooksUseCase(repo: BookRepository) {
  return async (params: {
    query: string;
    excludeOwnerId?: string;
    limit?: number;
  }): Promise<Book[]> => {
    const res = await repo.searchPublic(params.query, params.limit ?? 30);
    return params.excludeOwnerId ? res.filter((b) => b.ownerId !== params.excludeOwnerId) : res;
  };
}
