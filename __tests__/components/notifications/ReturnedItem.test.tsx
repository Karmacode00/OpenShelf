import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';

jest.mock('@hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#111'),
}));

import ReturnedItem from '@/components/notifications/ReturnedItem';
import type { NotifDevuelto } from '@/types/notifications';

const notif = {
  id: 'n4',
  type: 'devuelto',
  title: 'Libro devuelto',
  body: 'El usuario devolvió tu libro',
  unread: true,
  createdAt: Date.now(),
  data: { bookId: 'b4', borrowerId: 'u9', userName: 'Ana' },
} as unknown as NotifDevuelto;

describe('ReturnedItem', () => {
  it('renderiza título y cuerpo', () => {
    renderWithProviders(<ReturnedItem item={notif} onRateUser={jest.fn()} />);
    expect(screen.getByText(/libro devuelto/i)).toBeTruthy();
    expect(screen.getByText(/devolvió tu libro/i)).toBeTruthy();
  });

  it('calificar usuario → onRateUser(borrowerId, userName)', () => {
    const onRateUser = jest.fn();
    renderWithProviders(<ReturnedItem item={notif} onRateUser={onRateUser} />);
    const btn =
      screen.queryByRole?.('button', { name: /calificar usuario/i } as any) ??
      screen.getByText(/calificar usuario/i);
    fireEvent.press(btn);
    expect(onRateUser).toHaveBeenCalledWith('u9', 'Ana');
  });
});
