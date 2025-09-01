import * as fs from 'firebase/firestore';

import { UserRepositoryFirebase } from '@/data/repositories/UserRepositoryFirebase';

jest.mock('@/services/firebase', () => ({
  auth: { __brand: 'auth' },
  db: { __brand: 'db' },
}));

describe('UserRepositoryFirebase.getUserLocation', () => {
  const repo = new UserRepositoryFirebase();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna null cuando el documento no existe', async () => {
    (fs.doc as jest.Mock).mockReturnValue('users/uX');
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
    });

    const loc = await repo.getUserLocation('uX');
    expect(fs.doc).toHaveBeenCalledWith({ __brand: 'db' }, 'users', 'uX');
    expect(fs.getDoc).toHaveBeenCalledWith('users/uX');
    expect(loc).toBeNull();
  });

  it('retorna null cuando location está ausente o inválida', async () => {
    (fs.doc as jest.Mock).mockReturnValue('users/u1');
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ location: { latitude: 'bad', longitude: -70.67 } }),
    });

    const loc = await repo.getUserLocation('u1');
    expect(loc).toBeNull();
  });

  it('retorna la ubicación válida (con formattedAddress si existe, o null)', async () => {
    (fs.doc as jest.Mock).mockReturnValue('users/u1');
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        location: { latitude: -33.45, longitude: -70.67, formattedAddress: 'Santiago' },
      }),
    });

    const loc = await repo.getUserLocation('u1');
    expect(loc).toEqual({
      latitude: -33.45,
      longitude: -70.67,
      formattedAddress: 'Santiago',
    });

    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        location: { latitude: -33.45, longitude: -70.67 },
      }),
    });

    const loc2 = await repo.getUserLocation('u1');
    expect(loc2).toEqual({
      latitude: -33.45,
      longitude: -70.67,
      formattedAddress: null,
    });
  });
});
