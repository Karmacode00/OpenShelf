import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';

import ActionCard from '@/components/ActionCard';

describe('ActionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza título y subtítulo', () => {
    renderWithProviders(
      <ActionCard title="Crear libro" subtitle="Agrega uno nuevo" onPress={jest.fn()} />,
    );

    expect(screen.getByText('Crear libro')).toBeTruthy();
    expect(screen.getByText('Agrega uno nuevo')).toBeTruthy();
  });

  it('no renderiza subtítulo cuando no se provee', () => {
    renderWithProviders(<ActionCard title="Solo título" onPress={jest.fn()} />);

    expect(screen.getByText('Solo título')).toBeTruthy();
    expect(screen.queryByText(/agrega uno nuevo/i)).toBeNull();
  });

  it('usa el icono por defecto "add-circle" y el chevron', () => {
    renderWithProviders(<ActionCard title="Crear" onPress={jest.fn()} />);

    const icons = screen.getAllByTestId('icon');
    expect(icons.length).toBe(2);

    const names = icons.map((i: any) => i.props.name);
    expect(names).toEqual(expect.arrayContaining(['add-circle', 'chevron-forward']));
  });

  it('usa icon prop cuando se provee', () => {
    renderWithProviders(<ActionCard title="Editar" icon="create" onPress={jest.fn()} />);

    const names = screen.getAllByTestId('icon').map((i: any) => i.props.name);
    expect(names).toContain('create');
  });

  it('aplica colores del tema: card en contenedor y textContrast en iconos', () => {
    renderWithProviders(<ActionCard title="Tema" subtitle="Colores" onPress={jest.fn()} />);

    const root = screen.getByTestId('action-card');
    expect(root).toHaveStyle({ backgroundColor: 'cardColor' });

    const icons = screen.getAllByTestId('icon');
    icons.forEach((i: any) => expect(i.props.color).toBe('contrastColor'));
  });

  it('dispara onPress al presionar la tarjeta', () => {
    const onPress = jest.fn();
    renderWithProviders(<ActionCard title="Tap" subtitle="tap" onPress={onPress} />);

    const root = screen.getByTestId('action-card');
    expect(root).toHaveStyle({ backgroundColor: 'cardColor' });
    fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
