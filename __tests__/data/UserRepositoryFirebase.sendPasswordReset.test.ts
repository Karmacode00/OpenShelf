import { sendPasswordResetEmail } from 'firebase/auth';

import { UserRepositoryFirebase } from '@/data/repositories/UserRepositoryFirebase';

jest.mock('@/services/firebase', () => ({
  auth: { __brand: 'auth' }, // objeto simulado pasado al auth de Firebase
  db: { __brand: 'db' },
}));

const sendPasswordResetEmailMock = sendPasswordResetEmail as unknown as jest.Mock;
sendPasswordResetEmailMock.mockResolvedValue(undefined);

describe('UserRepositoryFirebase.sendPasswordReset', () => {
  const repo = new UserRepositoryFirebase();

  beforeEach(() => {
    sendPasswordResetEmailMock.mockReset();
  });

  it('llama sendPasswordResetEmail(auth, email)', async () => {
    sendPasswordResetEmailMock.mockResolvedValue(undefined);

    await expect(repo.sendPasswordReset('user@example.com')).resolves.toBeUndefined();

    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      { __brand: 'auth' },
      'user@example.com',
    );
  });

  it('propaga errores del SDK', async () => {
    sendPasswordResetEmailMock.mockRejectedValue(new Error('INVALID_EMAIL'));

    await expect(repo.sendPasswordReset('bad')).rejects.toThrow(/INVALID_EMAIL/);
  });
});
