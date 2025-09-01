import * as Notifications from 'expo-notifications';
import * as Auth from 'firebase/auth';
import * as Functions from 'firebase/functions';

import { registerPushForCurrentUser, unregisterPushForCurrentUser } from '@/services/push';

describe('services/push', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerPushForCurrentUser', () => {
    it('sin usuario → lanza error', async () => {
      (Auth.getAuth as jest.Mock).mockReturnValue({ currentUser: null });

      await expect(registerPushForCurrentUser()).rejects.toThrow(/no hay usuario autenticado/i);
    });

    it('permiso denegado tras solicitarlo → retorna temprano (no llama a CF)', async () => {
      (Auth.getAuth as jest.Mock).mockReturnValue({ currentUser: { uid: 'u1' } });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      await expect(registerPushForCurrentUser()).resolves.toBeUndefined();
      expect(Functions.httpsCallable).not.toHaveBeenCalled();
    });

    it('flujo feliz → obtiene token y llama a registerPushToken', async () => {
      (Auth.getAuth as jest.Mock).mockReturnValue({ currentUser: { uid: 'u1' } });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[abc123]',
      });

      const callable = jest.fn().mockResolvedValue({});
      (Functions.httpsCallable as jest.Mock).mockReturnValue(callable);

      await expect(registerPushForCurrentUser()).resolves.toBeUndefined();

      expect(Functions.getFunctions).toHaveBeenCalledWith({ __brand: 'app' }, 'us-central1');
      expect(Functions.httpsCallable).toHaveBeenCalledWith({ __brand: 'fns' }, 'registerPushToken');
      expect(callable).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'ExponentPushToken[abc123]',
          platform: expect.any(String),
        }),
      );
    });

    it('error en callable → loguea y propaga', async () => {
      (Auth.getAuth as jest.Mock).mockReturnValue({ currentUser: { uid: 'u1' } });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[z]',
      });

      const err = Object.assign(new Error('boom'), {
        code: 'failed-precondition',
        details: { reason: 'whatever' },
      });
      const callable = jest.fn().mockRejectedValue(err);
      (Functions.httpsCallable as jest.Mock).mockReturnValue(callable);

      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(registerPushForCurrentUser()).rejects.toThrow('boom');

      expect(spy).toHaveBeenCalledWith(
        'registerPushToken failed',
        expect.objectContaining({
          code: 'failed-precondition',
          message: 'boom',
          details: expect.anything(),
        }),
      );

      spy.mockRestore();
    });
  });

  describe('unregisterPushForCurrentUser', () => {
    it('sin usuario → retorna temprano y no llama a CF', async () => {
      (Auth.getAuth as jest.Mock).mockReturnValue({ currentUser: null });

      await expect(unregisterPushForCurrentUser()).resolves.toBeUndefined();
      expect(Functions.httpsCallable).not.toHaveBeenCalled();
    });

    it('flujo feliz → obtiene token y llama a unregisterPushToken', async () => {
      (Auth.getAuth as jest.Mock).mockReturnValue({ currentUser: { uid: 'u7' } });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[bye-123]',
      });

      const callable = jest.fn().mockResolvedValue({});
      (Functions.httpsCallable as jest.Mock).mockReturnValue(callable);

      await expect(unregisterPushForCurrentUser()).resolves.toBeUndefined();

      expect(Functions.getFunctions).toHaveBeenCalledWith({ __brand: 'app' }, 'us-central1');
      expect(Functions.httpsCallable).toHaveBeenCalledWith(
        { __brand: 'fns' },
        'unregisterPushToken',
      );
      expect(callable).toHaveBeenCalledWith({ token: 'ExponentPushToken[bye-123]' });
    });

    it('error en callable → loguea y propaga', async () => {
      (Auth.getAuth as jest.Mock).mockReturnValue({ currentUser: { uid: 'u9' } });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[oops]',
      });

      const err = Object.assign(new Error('bad'), {
        code: 'internal',
        details: { more: true },
      });
      const callable = jest.fn().mockRejectedValue(err);
      (Functions.httpsCallable as jest.Mock).mockReturnValue(callable);

      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(unregisterPushForCurrentUser()).rejects.toThrow('bad');

      expect(spy).toHaveBeenCalledWith(
        'unregisterPushToken failed',
        expect.objectContaining({
          code: 'internal',
          message: 'bad',
          details: expect.anything(),
        }),
      );

      spy.mockRestore();
    });
  });
});
