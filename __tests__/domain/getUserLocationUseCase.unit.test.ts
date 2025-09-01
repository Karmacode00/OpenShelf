import { makeUserRepoMock } from '@testutils/makeUserRepoMock';

import { getUserLocationUseCase } from '@/domain/usecases/getUserLocation';

describe('usecase: getUserLocationUseCase', () => {
  it('llama repo.getUserLocation(userId) y retorna la ubicación', async () => {
    const repo = makeUserRepoMock({
      getUserLocation: jest.fn().mockResolvedValue({
        latitude: -33.45,
        longitude: -70.67,
        formattedAddress: 'Santiago, Chile',
      }),
    });

    const getUserLocation = getUserLocationUseCase(repo);
    const loc = await getUserLocation('u1');

    expect(repo.getUserLocation).toHaveBeenCalledWith('u1');
    expect(loc).toEqual({
      latitude: -33.45,
      longitude: -70.67,
      formattedAddress: 'Santiago, Chile',
    });
  });

  it('retorna null si el repo no tiene ubicación', async () => {
    const repo = makeUserRepoMock({
      getUserLocation: jest.fn().mockResolvedValue(null),
    });

    const getUserLocation = getUserLocationUseCase(repo);
    const loc = await getUserLocation('uX');

    expect(repo.getUserLocation).toHaveBeenCalledWith('uX');
    expect(loc).toBeNull();
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeUserRepoMock({
      getUserLocation: jest.fn().mockRejectedValue(new Error('NOT_FOUND')),
    });

    const getUserLocation = getUserLocationUseCase(repo);
    await expect(getUserLocation('u1')).rejects.toThrow(/NOT_FOUND/);
  });
});
