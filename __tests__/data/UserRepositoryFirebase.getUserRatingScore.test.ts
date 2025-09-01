import * as fs from 'firebase/firestore';

import { UserRepositoryFirebase } from '@/data/repositories/UserRepositoryFirebase';

describe('UserRepositoryFirebase.getUserRatingScore', () => {
  const repo = new UserRepositoryFirebase();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cuando el doc no existe → retorna 0', async () => {
    (fs.doc as jest.Mock).mockReturnValue('users/u0');
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
    });

    const score = await repo.getUserRatingScore('u0');
    expect(fs.doc).toHaveBeenCalledWith({ __brand: 'db' }, 'users', 'u0');
    expect(score).toBe(0);
  });

  it('cuando count === 0 → retorna null', async () => {
    (fs.doc as jest.Mock).mockReturnValue('users/u1');
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ rating: { total: 0, count: 0 } }),
    });

    const score = await repo.getUserRatingScore('u1');
    expect(score).toBeNull();
  });

  it('retorna total/count como número', async () => {
    (fs.doc as jest.Mock).mockReturnValue('users/u2');
    (fs.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ rating: { total: 9, count: 3 } }),
    });

    const score = await repo.getUserRatingScore('u2');
    expect(score).toBeCloseTo(3);
  });

  it('propaga errores (try/catch vuelve a lanzar)', async () => {
    (fs.doc as jest.Mock).mockReturnValue('users/uE');
    (fs.getDoc as jest.Mock).mockRejectedValue(new Error('boom'));

    await expect(repo.getUserRatingScore('uE')).rejects.toThrow(/boom/);
  });
});
