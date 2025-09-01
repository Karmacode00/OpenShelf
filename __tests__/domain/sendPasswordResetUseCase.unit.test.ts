import { makeUserRepoMock } from '@testutils/makeUserRepoMock';

import { sendPasswordResetUseCase } from '@/domain/usecases/sendPasswordReset';

describe('usecase: sendPasswordResetUseCase', () => {
  const email = 'user@example.com';

  it('llama repo.sendPasswordReset(email) y resuelve', async () => {
    const repo = makeUserRepoMock({
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    });

    const reset = sendPasswordResetUseCase(repo);
    await expect(reset(email)).resolves.toBeUndefined();

    expect(repo.sendPasswordReset).toHaveBeenCalledTimes(1);
    expect(repo.sendPasswordReset).toHaveBeenCalledWith(email);
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeUserRepoMock({
      sendPasswordReset: jest.fn().mockRejectedValue(new Error('INVALID_EMAIL')),
    });

    const reset = sendPasswordResetUseCase(repo);
    await expect(reset('bad')).rejects.toThrow(/INVALID_EMAIL/);

    expect(repo.sendPasswordReset).toHaveBeenCalledTimes(1);
    expect(repo.sendPasswordReset).toHaveBeenCalledWith('bad');
  });

  it('puede ejecutarse varias veces', async () => {
    const repo = makeUserRepoMock({
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    });

    const reset = sendPasswordResetUseCase(repo);
    await reset('a@b.com');
    await reset('c@d.com');

    expect(repo.sendPasswordReset).toHaveBeenNthCalledWith(1, 'a@b.com');
    expect(repo.sendPasswordReset).toHaveBeenNthCalledWith(2, 'c@d.com');
  });
});
