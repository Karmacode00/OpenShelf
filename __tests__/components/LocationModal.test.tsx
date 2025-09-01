import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';
import * as Location from 'expo-location';
import LocationModal from '@/components/LocationModal';

jest.mock('@/di/container', () => ({
  getUserRepository: jest.fn(() => ({})),
}));

jest.mock('@/domain/usecases/saveUserLocation', () => ({
  saveUserLocationUseCase: jest.fn(() => async (_userId: string, _loc: any) => {}),
}));

describe('LocationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permiso denegado → muestra ayuda', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });

    renderWithProviders(
      <LocationModal visible onClose={jest.fn()} onSaved={jest.fn()} userId="a5" />,
    );

    await waitFor(() => expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled());

    const help =
      screen.queryByText(/Permiso de ubicación denegado/i) ??
      screen.queryByText(/Habil[ií]talo en Ajustes/i);
    expect(help).toBeTruthy();
  });

  it('con coords válidas → habilita Guardar y llama onSaved', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: -33.45, longitude: -70.67 },
    });

    const onSaved = jest.fn();
    renderWithProviders(
      <LocationModal visible onClose={jest.fn()} onSaved={onSaved} userId="e4" />,
    );

    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    const saveBtn = screen.getByTestId('save-button');
    expect(saveBtn.props?.accessibilityState?.disabled).toBeFalsy();
    fireEvent.press(saveBtn);
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('sin GPS → usa last known y muestra placeholder si tampoco hay', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('no gps'));
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue(null);

    renderWithProviders(
      <LocationModal visible onClose={jest.fn()} onSaved={jest.fn()} userId="h8" />,
    );

    await waitFor(() => expect(Location.getLastKnownPositionAsync).toHaveBeenCalled());

    const placeholder =
      screen.queryByText(/No pudimos obtener tu ubicación/i) ??
      screen.queryByText(/int[eé]ntalo de nuevo/i);
    expect(placeholder).toBeTruthy();
  });
});
