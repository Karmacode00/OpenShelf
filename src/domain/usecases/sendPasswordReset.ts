import { UserRepository } from '../repositories/UserRepository';

export function sendPasswordResetUseCase(repo: UserRepository) {
  return async (email: string) => {
    await repo.sendPasswordReset(email);
  };
}
