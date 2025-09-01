import { UserRepository } from '../repositories/UserRepository';

export function rateUserUseCase(repo: UserRepository) {
  return async ({
    raterId,
    ratedId,
    rating,
    comment,
  }: {
    raterId: string;
    ratedId: string;
    rating: number;
    comment?: string;
  }) => {
    if (rating < 1 || rating > 5) throw new Error('Calificación inválida');
    await repo.rateUser(raterId, ratedId, rating, comment);
  };
}
