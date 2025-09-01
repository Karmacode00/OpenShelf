import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';
import * as fs from 'firebase/firestore';

import NotificationBell from '@/components/NotificationBell';

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sin user: no se suscribe y no muestra badge', () => {
    renderWithProviders(<NotificationBell />, { auth: { user: null } });

    expect(fs.onSnapshot).not.toHaveBeenCalled();
    expect(screen.getByTestId('notification-bell')).toBeTruthy();
    expect(screen.queryByTestId('notification-dot')).toBeNull();
  });

  it('con user y snapshot vacío: no badge', () => {
    const unsub = jest.fn();
    (fs.onSnapshot as jest.Mock).mockImplementation((_q, cb) => {
      cb({ empty: true });
      return unsub;
    });

    const { unmount } = renderWithProviders(<NotificationBell />, {
      auth: { user: { uid: 'u1' } as any },
    });

    expect(fs.onSnapshot).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('notification-dot')).toBeNull();

    unmount();
    expect(unsub).toHaveBeenCalled();
  });

  it('con user y snapshot con docs: muestra badge', () => {
    (fs.onSnapshot as jest.Mock).mockImplementation((_q, cb) => {
      cb({ empty: false });
      return jest.fn();
    });

    renderWithProviders(<NotificationBell />, { auth: { user: { uid: 'u1' } as any } });

    expect(fs.onSnapshot).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('notification-dot')).toBeTruthy();
  });

  it('al cambiar user limpia anterior y crea nueva suscripción', () => {
    const unsub1 = jest.fn();
    const unsub2 = jest.fn();

    (fs.onSnapshot as jest.Mock).mockImplementationOnce((_q, cb) => {
      cb({ empty: true });
      return unsub1;
    });

    const first = renderWithProviders(<NotificationBell />, {
      auth: { user: { uid: 'u1' } as any },
    });
    expect(fs.onSnapshot).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('notification-dot')).toBeNull();

    first.unmount();
    expect(unsub1).toHaveBeenCalled();

    (fs.onSnapshot as jest.Mock).mockImplementationOnce((_q, cb) => {
      cb({ empty: false });
      return unsub2;
    });

    renderWithProviders(<NotificationBell />, {
      auth: { user: { uid: 'u2' } as any },
    });
    expect(fs.onSnapshot).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('notification-dot')).toBeTruthy();
  });

  it('onPress dispara callback', () => {
    (fs.onSnapshot as jest.Mock).mockImplementation((_q, cb) => {
      cb({ empty: true });
      return jest.fn();
    });

    const onPress = jest.fn();
    renderWithProviders(<NotificationBell onPress={onPress} />, {
      auth: { user: { uid: 'u1' } as any },
    });

    fireEvent.press(screen.getByTestId('notification-bell'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
