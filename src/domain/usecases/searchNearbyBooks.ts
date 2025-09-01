import type { Book } from '@/domain/entities/Book';
import type { BookRepository } from '@/domain/repositories/BookRepository';

export function searchNearbyBooksUseCase(repo: BookRepository) {
  return async (params: {
    center: { latitude: number; longitude: number };
    radiusKm: number;
    excludeOwnerId?: string;
    limitNum?: number;
    showBorrowed?: boolean;
    queryText?: string;
  }): Promise<(Book & { distanceKm: number })[]> => {
    const res = await repo.searchNearbyPublic({
      center: params.center,
      radiusKm: params.radiusKm,
      limitNum: params.limitNum ?? 50,
      excludeOwnerId: params.excludeOwnerId,
      showBorrowed: params.showBorrowed ?? false,
      queryText: params.queryText,
    });
    return res;
  };
}
