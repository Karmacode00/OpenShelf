import { makeUserRepoMock } from '@testutils/makeUserRepoMock';

import { getUserRatingScoreUseCase } from '@/domain/usecases/getUserRatingScore';

describe('usecase: getUserRatingScoreUseCase', () => {
  it('retorna el score numérico del repositorio', async () => {
    const repo = makeUserRepoMock({
      getUserRatingScore: jest.fn().mockResolvedValue(4.25),
    });

    const getScore = getUserRatingScoreUseCase(repo as any);
    const score = await getScore('u1');

    expect(repo.getUserRatingScore).toHaveBeenCalledWith('u1');
    expect(score).toBeCloseTo(4.25);
  });

  it('retorna null cuando el repositorio indica ausencia de score', async () => {
    const repo = makeUserRepoMock({
      getUserRatingScore: jest.fn().mockResolvedValue(null),
    });

    const getScore = getUserRatingScoreUseCase(repo as any);
    const score = await getScore('uX');

    expect(repo.getUserRatingScore).toHaveBeenCalledWith('uX');
    expect(score).toBeNull();
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeUserRepoMock({
      getUserRatingScore: jest.fn().mockRejectedValue(new Error('DB_FAIL')),
    });

    const getScore = getUserRatingScoreUseCase(repo as any);
    await expect(getScore('u1')).rejects.toThrow(/DB_FAIL/);
  });
});
