import type { UserRepository } from '@/domain/repositories/UserRepository';

export function saveUserLocationUseCase(repo: UserRepository) {
  return (
    userId: string,
    loc: {
      latitude: number;
      longitude: number;
      formattedAddress?: string | null;
    },
  ) => repo.saveUserLocation(userId, loc);
}
