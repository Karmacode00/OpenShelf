import { makeUserRepoMock } from '@testutils/makeUserRepoMock';

import { saveUserLocationUseCase } from '@/domain/usecases/saveUserLocation';

describe('usecase: saveUserLocationUseCase', () => {
  const location = { latitude: -33.45, longitude: -70.67, formattedAddress: 'Santiago, Chile' };

  it('llama repo.saveUserLocation(userId, location) y resuelve', async () => {
    const repo = makeUserRepoMock({
      saveUserLocation: jest.fn().mockResolvedValue(undefined),
    });

    const saveUserLocation = saveUserLocationUseCase(repo as any);
    await expect(saveUserLocation('u1', location)).resolves.toBeUndefined();

    expect(repo.saveUserLocation).toHaveBeenCalledWith('u1', location);
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeUserRepoMock({
      saveUserLocation: jest.fn().mockRejectedValue(new Error('PERMISSION_DENIED')),
    });

    const saveUserLocation = saveUserLocationUseCase(repo as any);
    await expect(saveUserLocation('u1', location)).rejects.toThrow(/PERMISSION_DENIED/);
  });
});
