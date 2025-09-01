import type { UserRepository } from '@/domain/repositories/UserRepository';
import { UserProfile } from '../entities/UserProfile';

export function upsertCurrentUserProfileUseCase(repo: UserRepository) {
  return async (user: UserProfile) => {
    await repo.upsertProfile(user);
  };
}
