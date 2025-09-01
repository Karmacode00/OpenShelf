import { upsertCurrentUserProfileUseCase } from '@/domain/usecases/upsertCurrentUser';

describe('upsertCurrentUserProfileUseCase', () => {
  it('llama repo.upsertProfile con el usuario recibido', async () => {
    const repo = { upsertProfile: jest.fn().mockResolvedValue(undefined) } as any;
    const upsert = upsertCurrentUserProfileUseCase(repo);

    const user = {
      uid: 'u1',
      displayName: 'Ada',
      email: 'ada@lovelace.dev',
      photoURL: null,
      location: null,
    };

    await expect(upsert(user)).resolves.toBeUndefined();

    expect(repo.upsertProfile).toHaveBeenCalledTimes(1);
    expect(repo.upsertProfile).toHaveBeenCalledWith(user);
  });

  it('propaga errores del repositorio', async () => {
    const repo = { upsertProfile: jest.fn().mockRejectedValue(new Error('boom')) } as any;
    const upsert = upsertCurrentUserProfileUseCase(repo);

    await expect(
      upsert({
        uid: 'u2',
        displayName: null,
        email: null,
        photoURL: null,
        location: null,
      }),
    ).rejects.toThrow('boom');
  });

  it('devuelve una función (currying) que espera un usuario', () => {
    const repo = { upsertProfile: jest.fn() } as any;
    const upsert = upsertCurrentUserProfileUseCase(repo);
    expect(typeof upsert).toBe('function');
  });
});
