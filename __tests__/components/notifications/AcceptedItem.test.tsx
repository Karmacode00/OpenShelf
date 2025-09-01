import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';

jest.mock('@hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#111'),
}));

import AcceptedItem from '@/components/notifications/AcceptedItem';
import type { NotifAceptado } from '@/types/notifications';

const notif = {
  id: 'n2',
  type: 'aceptado',
  title: 'Solicitud aceptada',
  body: 'El dueño aceptó tu solicitud',
  unread: true,
  createdAt: Date.now(),
  data: { bookId: 'b2', ownerEmail: 'owner@example.com' },
} as unknown as NotifAceptado;

describe('AcceptedItem', () => {
  it('renderiza título, cuerpo y email del dueño', () => {
    renderWithProviders(<AcceptedItem item={notif} onMarkRead={jest.fn()} />);
    expect(screen.getByText(/solicitud aceptada/i)).toBeTruthy();
    expect(screen.getByText(/el dueño aceptó tu solicitud/i)).toBeTruthy();
    expect(screen.getByText(/owner@example\.com/i)).toBeTruthy();
  });

  it('onMarkRead recibe el id al presionar close', () => {
    const onMarkRead = jest.fn();
    renderWithProviders(<AcceptedItem item={notif} onMarkRead={onMarkRead} />);
    fireEvent.press(screen.getByTestId('accepted-close'));
    expect(onMarkRead).toHaveBeenCalledWith('n2');
  });

  it('si no se pasa onMarkRead, no muestra botón', () => {
    renderWithProviders(<AcceptedItem item={notif} />);
    expect(screen.queryByTestId('accepted-close')).toBeNull();
  });
});
