import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';

jest.mock('@hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#111'),
}));

import RejectedItem from '@/components/notifications/RejectedItem';
import type { NotifRechazado } from '@/types/notifications';

const notif = {
  id: 'n3',
  type: 'rechazado',
  title: 'Solicitud rechazada',
  body: 'El dueño rechazó tu solicitud',
  unread: false,
  createdAt: Date.now(),
  data: { bookId: 'b3' },
} as unknown as NotifRechazado;

describe('RejectedItem', () => {
  it('renderiza título y cuerpo', () => {
    renderWithProviders(<RejectedItem item={notif} />);
    expect(screen.getByText(/solicitud rechazada/i)).toBeTruthy();
    expect(screen.getByText(/rechazó tu solicitud/i)).toBeTruthy();
  });
});
