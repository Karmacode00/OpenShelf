import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';
import InlineButton from '@/components/InlineButton';

describe('InlineButton', () => {
  it('ejecuta onPress', () => {
    const onPress = jest.fn();
    renderWithProviders(<InlineButton testID="inline" onPress={onPress} label="Ver más" />);
    const btn = screen.getByTestId('inline');
    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalled();
  });
});
