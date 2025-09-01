import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';

jest.mock('@hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#111'),
}));

import NotificationList from '@/components/notifications/NotificationList';
import type { AppNotification } from '@/types/notifications';

describe('NotificationList (integración real)', () => {
  it('estado vacío', () => {
    renderWithProviders(
      <NotificationList
        items={[]}
        onAcceptRequest={jest.fn()}
        onRejectRequest={jest.fn()}
        onRateUser={jest.fn()}
      />,
    );
    expect(screen.getByText(/no tienes notificaciones\./i)).toBeTruthy();
  });

  it('renderiza los 4 tipos y propaga callbacks', () => {
    const items: AppNotification[] = [
      {
        id: 'n1',
        type: 'solicitud',
        title: 'Nueva solicitud',
        body: 'Alguien quiere tu libro',
        unread: true,
        createdAt: Date.now(),
        data: { bookId: 'b1', borrowerId: 'u1', borrowerName: 'Lau' },
      } as any,
      {
        id: 'n2',
        type: 'aceptado',
        title: 'Solicitud aceptada',
        body: 'El dueño aceptó tu solicitud',
        unread: true,
        createdAt: Date.now(),
        data: { bookId: 'b2', ownerEmail: 'owner@example.com' },
      } as any,
      {
        id: 'n3',
        type: 'rechazado',
        title: 'Solicitud rechazada',
        body: 'El dueño rechazó tu solicitud',
        unread: false,
        createdAt: Date.now(),
        data: { bookId: 'b3' },
      } as any,
      {
        id: 'n4',
        type: 'devuelto',
        title: 'Libro devuelto',
        body: 'Califica al usuario',
        unread: true,
        createdAt: Date.now(),
        data: { bookId: 'b4', borrowerId: 'u9', userName: 'Ana' },
      } as any,
    ];

    const onMarkRead = jest.fn();
    const onAcceptRequest = jest.fn();
    const onRejectRequest = jest.fn();
    const onRateUser = jest.fn();

    renderWithProviders(
      <NotificationList
        items={items}
        onMarkRead={onMarkRead}
        onAcceptRequest={onAcceptRequest}
        onRejectRequest={onRejectRequest}
        onRateUser={onRateUser}
      />,
    );

    expect(screen.getByText(/nueva solicitud/i)).toBeTruthy();
    expect(screen.getByText(/solicitud aceptada/i)).toBeTruthy();
    expect(screen.getByText(/solicitud rechazada/i)).toBeTruthy();
    expect(screen.getByText(/libro devuelto/i)).toBeTruthy();

    const acceptBtn =
      screen.queryByRole?.('button', { name: /aceptar/i } as any) ?? screen.getByText(/aceptar/i);
    fireEvent.press(acceptBtn);
    expect(onAcceptRequest).toHaveBeenCalledWith('b1', 'n1');

    const rejectBtn =
      screen.queryByRole?.('button', { name: /rechazar/i } as any) ?? screen.getByText(/rechazar/i);
    fireEvent.press(rejectBtn);
    expect(onRejectRequest).toHaveBeenCalledWith('b1', 'n1');

    fireEvent.press(screen.getByTestId('accepted-close'));
    expect(onMarkRead).toHaveBeenCalledWith('n2');

    const rateBtn =
      screen.queryByRole?.('button', { name: /calificar usuario/i } as any) ??
      screen.getByText(/calificar usuario/i);
    fireEvent.press(rateBtn);
    expect(onRateUser).toHaveBeenCalledWith('u9', 'Ana', 'n4');
  });
});
