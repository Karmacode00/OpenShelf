import type { UserRepository } from '@/domain/repositories/UserRepository';

export function getUserRatingScoreUseCase(repo: UserRepository) {
  return async (userId: string): Promise<number | null> => {
    return await repo.getUserRatingScore(userId);
  };
}
