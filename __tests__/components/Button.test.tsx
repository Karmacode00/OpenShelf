import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';
import Button from '@/components/Button';

describe('Button', () => {
  it('renderiza tipo secondary', () => {
    const onPress = jest.fn();
    renderWithProviders(
      <Button testID="btn" variant="secondary" onPress={onPress} label={'Eliminar'} />,
    );

    const btn = screen.getByTestId('btn');
    expect(screen.getByText(/eliminar/i)).toBeTruthy();

    expect(btn).toBeDefined();
  });

  it('renderiza el label y dispara onPress', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button testID="btn" onPress={onPress} label={'Eliminar'} />);

    const btn = screen.getByTestId('btn');
    expect(screen.getByText(/eliminar/i)).toBeTruthy();

    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalled();
  });

  it('no dispara onPress cuando está disabled', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button testID="btn" disabled onPress={onPress} label={'Guardar'} />);

    fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
