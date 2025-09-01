import React from 'react';
import { Text } from 'react-native';
import { render, screen, act } from '@testing-library/react-native';

import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';
import { auth } from '@/services/firebase';
import * as Auth from 'firebase/auth';
import { getUserRepository } from '@/di/container';
import { upsertCurrentUserProfileUseCase } from '@/domain/usecases/upsertCurrentUser';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('@/di/container', () => ({
  getUserRepository: jest.fn(() => ({ __brand: 'UserRepo' })),
}));

const mockUpsert = jest.fn();
jest.mock('@/domain/usecases/upsertCurrentUser', () => ({
  upsertCurrentUserProfileUseCase: jest.fn(() => mockUpsert),
}));

let api: ReturnType<typeof useAuthViewModel>;
function Probe() {
  api = useAuthViewModel();
  return (
    <>
      <Text testID="user">{api.user?.uid ?? 'null'}</Text>
      <Text testID="loading">{String(api.loading)}</Text>
      <Text testID="error">{api.error ?? ''}</Text>
    </>
  );
}

describe('useAuthViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = null;

    (Auth.onAuthStateChanged as jest.Mock).mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn(); // unsubscribe
    });
  });

  it('al montar: ejecuta onAuthStateChanged, setea loading=false y user=null', async () => {
    render(<Probe />);

    expect(Auth.onAuthStateChanged).toHaveBeenCalled();
    expect(screen.getByTestId('loading').props.children).toBe('false');
    expect(screen.getByTestId('user').props.children).toBe('null');
  });

  it('si onAuthStateChanged entrega un usuario: user refleja el uid', async () => {
    (Auth.onAuthStateChanged as jest.Mock).mockImplementationOnce((_auth, cb) => {
      cb({ uid: 'u-42' });
      return jest.fn();
    });

    render(<Probe />);
    expect(screen.getByTestId('user').props.children).toBe('u-42');
    expect(screen.getByTestId('loading').props.children).toBe('false');
  });

  it('login: éxito → llama signInWithEmailAndPassword y no deja error', async () => {
    (Auth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({});

    render(<Probe />);

    await act(async () => {
      await api.login('a@b.com', 'secret');
    });

    expect(Auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'a@b.com',
      'secret',
    );
    expect(screen.getByTestId('error').props.children).toBe('');
    expect(screen.getByTestId('loading').props.children).toBe('false');
  });

  it('login: error → setea error', async () => {
    (Auth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('bad-credentials'));

    render(<Probe />);

    await act(async () => {
      await api.login('x@y.z', 'nope');
    });

    expect(screen.getByTestId('error').props.children).toBe('bad-credentials');
    expect(screen.getByTestId('loading').props.children).toBe('false');
  });

  it('register: con currentUser → updateProfile y upsert profile via use case', async () => {
    (auth as any).currentUser = { uid: 'u1', email: 'me@x.com', photoURL: 'pic.jpg' };
    (Auth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({});
    (Auth.updateProfile as jest.Mock).mockResolvedValue(undefined);
    mockUpsert.mockResolvedValue(undefined);

    render(<Probe />);

    await act(async () => {
      await api.register('me@x.com', 'pass', 'Pepita');
    });

    expect(Auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'me@x.com',
      'pass',
    );
    expect(Auth.updateProfile).toHaveBeenCalledWith((auth as any).currentUser, {
      displayName: 'Pepita',
    });

    expect(getUserRepository).toHaveBeenCalled();
    expect(upsertCurrentUserProfileUseCase).toHaveBeenCalledWith({ __brand: 'UserRepo' });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: 'u1',
        displayName: 'Pepita',
        email: 'me@x.com',
        photoURL: 'pic.jpg',
        location: null,
      }),
    );

    expect(screen.getByTestId('error').props.children).toBe('');
    expect(screen.getByTestId('loading').props.children).toBe('false');
  });

  it('register: sin currentUser → no llama updateProfile ni upsert', async () => {
    (auth as any).currentUser = null;
    (Auth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({});

    render(<Probe />);

    await act(async () => {
      await api.register('a@b.c', '123', 'Name');
    });

    expect(Auth.updateProfile).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('register: error → setea error', async () => {
    (Auth.createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('boom'));

    render(<Probe />);

    await act(async () => {
      await api.register('e@e.e', 'p', 'N');
    });

    expect(screen.getByTestId('error').props.children).toBe('boom');
    expect(screen.getByTestId('loading').props.children).toBe('false');
  });

  it('logout: éxito → llama signOut', async () => {
    (Auth.signOut as jest.Mock).mockResolvedValue(undefined);

    render(<Probe />);

    await act(async () => {
      await api.logout();
    });

    expect(Auth.signOut).toHaveBeenCalledWith(expect.any(Object));
    expect(screen.getByTestId('error').props.children).toBe('');
  });
});
