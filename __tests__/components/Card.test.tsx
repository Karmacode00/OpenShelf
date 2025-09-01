import React from 'react';
import { Text } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';
import Card from '@/components/Card';

describe('Card', () => {
  it('renderiza children', () => {
    renderWithProviders(
      <Card testID="card">
        <Text>Contenido</Text>
      </Card>,
    );
    expect(screen.getByText('Contenido')).toBeTruthy();
  });
});
