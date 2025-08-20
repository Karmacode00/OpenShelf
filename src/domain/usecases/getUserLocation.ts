import type { UserRepository } from '@/domain/repositories/UserRepository';

export function getUserLocationUseCase(repo: UserRepository) {
  return (userId: string) => repo.getUserLocation(userId);
}
