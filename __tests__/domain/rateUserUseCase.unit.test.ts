import { makeUserRepoMock } from '@testutils/makeUserRepoMock';

import { rateUserUseCase } from '@/domain/usecases/rateUser';

describe('usecase: rateUserUseCase', () => {
  it('llama repo.rateUser(raterId, ratedId, rating, comment) y resuelve', async () => {
    const repo = makeUserRepoMock({
      rateUser: jest.fn().mockResolvedValue(undefined),
    });

    const rateUser = rateUserUseCase(repo as any);
    await expect(
      rateUser({ raterId: 'u1', ratedId: 'u2', rating: 5, comment: 'Excelente' }),
    ).resolves.toBeUndefined();

    expect(repo.rateUser).toHaveBeenCalledWith('u1', 'u2', 5, 'Excelente');
  });

  it('funciona sin comment (pasa undefined como 4° parámetro)', async () => {
    const repo = makeUserRepoMock({
      rateUser: jest.fn().mockResolvedValue(undefined),
    });

    const rateUser = rateUserUseCase(repo as any);
    await rateUser({ raterId: 'u1', ratedId: 'u2', rating: 4 });

    expect(repo.rateUser).toHaveBeenCalledWith('u1', 'u2', 4, undefined);
  });

  it('valida rango y NO llama al repositorio cuando rating está fuera de [1..5]', async () => {
    const repo = makeUserRepoMock({
      rateUser: jest.fn().mockResolvedValue(undefined),
    });

    const rateUser = rateUserUseCase(repo as any);

    await expect(rateUser({ raterId: 'u1', ratedId: 'u2', rating: 10 })).rejects.toThrow(
      /Calificación inválida/,
    );

    expect(repo.rateUser).not.toHaveBeenCalled();
  });

  it('propaga errores del repositorio cuando el rating es válido', async () => {
    const repo = makeUserRepoMock({
      // Simula un error del backend/Firestore/etc.
      rateUser: jest.fn().mockRejectedValue(new Error('DB_FAIL')),
    });

    const rateUser = rateUserUseCase(repo as any);

    await expect(rateUser({ raterId: 'u1', ratedId: 'u2', rating: 3 })).rejects.toThrow(/DB_FAIL/);

    expect(repo.rateUser).toHaveBeenCalledWith('u1', 'u2', 3, undefined);
  });
});
