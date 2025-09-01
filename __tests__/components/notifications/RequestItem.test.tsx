import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';

jest.mock('@hooks/useThemeColor', () => ({
  useThemeColor: jest.fn((_p: any, _t: string) => '#111'),
}));

import RequestItem from '@/components/notifications/RequestItem';
import type { NotifSolicitud } from '@/types/notifications';

const notif = {
  id: 'n1',
  type: 'solicitud',
  title: 'Nueva solicitud',
  body: 'Alguien quiere tu libro',
  unread: true,
  createdAt: Date.now(),
  data: { bookId: 'b1', borrowerId: 'uZ', borrowerName: 'Lau' },
} as unknown as NotifSolicitud;

describe('RequestItem', () => {
  it('renderiza título y cuerpo', () => {
    renderWithProviders(<RequestItem item={notif} onAccept={jest.fn()} onReject={jest.fn()} />);
    expect(screen.getByText(/nueva solicitud/i)).toBeTruthy();
    expect(screen.getByText(/alguien quiere tu libro/i)).toBeTruthy();
  });

  it('Aceptar → onAccept(bookId, notificationId)', () => {
    const onAccept = jest.fn();
    renderWithProviders(<RequestItem item={notif} onAccept={onAccept} onReject={jest.fn()} />);
    const btn =
      screen.queryByRole?.('button', { name: /aceptar/i } as any) ?? screen.getByText(/aceptar/i);
    fireEvent.press(btn);
    expect(onAccept).toHaveBeenCalledWith('b1', 'n1');
  });

  it('Rechazar → onReject(bookId, notificationId)', () => {
    const onReject = jest.fn();
    renderWithProviders(<RequestItem item={notif} onAccept={jest.fn()} onReject={onReject} />);
    const btn =
      screen.queryByRole?.('button', { name: /rechazar/i } as any) ?? screen.getByText(/rechazar/i);
    fireEvent.press(btn);
    expect(onReject).toHaveBeenCalledWith('b1', 'n1');
  });
});
