import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';

import RatingModal from '@/components/RatingModal';

describe('RatingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el título con el nombre del usuario', () => {
    renderWithProviders(
      <RatingModal visible userName="Alice" onClose={jest.fn()} onRate={jest.fn()} />,
    );

    expect(screen.getByText(/califica tu experiencia/i)).toBeTruthy();
    expect(screen.getByText(/Alice/)).toBeTruthy();
  });

  it('sin rating seleccionado: no llama onRate al presionar "Enviar"', () => {
    const onRate = jest.fn();
    renderWithProviders(<RatingModal visible userName="Bob" onClose={jest.fn()} onRate={onRate} />);

    fireEvent.press(screen.getByText(/enviar/i));
    expect(onRate).not.toHaveBeenCalled();
  });

  it('seleccionar estrellas y enviar con comentario (se trimea)', async () => {
    const onRate = jest.fn();
    const onClose = jest.fn();
    renderWithProviders(<RatingModal visible userName="Carol" onClose={onClose} onRate={onRate} />);

    const icons = screen.getAllByTestId('icon');
    expect(icons).toHaveLength(5);
    fireEvent.press(icons[3]); // rating = 4

    const namesAfter = screen.getAllByTestId('icon').map((n: any) => n.props.name);
    expect(namesAfter.slice(0, 4)).toEqual(['star', 'star', 'star', 'star']);
    expect(namesAfter[4]).toBe('star-outline');

    const input = screen.getByPlaceholderText(/deja un comentario/i);
    fireEvent.changeText(input, '   Muy bien   ');

    fireEvent.press(screen.getByText(/enviar/i));

    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith(4, 'Muy bien');
    expect(onClose).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      const resetNames = screen.getAllByTestId('icon').map((n: any) => n.props.name);
      expect(resetNames).toEqual([
        'star-outline',
        'star-outline',
        'star-outline',
        'star-outline',
        'star-outline',
      ]);
    });
  });

  it('enviar sin comentario ⇒ segundo argumento undefined', () => {
    const onRate = jest.fn();
    renderWithProviders(
      <RatingModal visible userName="Dave" onClose={jest.fn()} onRate={onRate} />,
    );

    const icons = screen.getAllByTestId('icon');
    fireEvent.press(icons[0]); // rating = 1

    fireEvent.press(screen.getByText(/enviar/i));

    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith(1, undefined);
  });

  it('botón "Cancelar" dispara onClose', () => {
    const onClose = jest.fn();
    renderWithProviders(
      <RatingModal visible userName="Eve" onClose={onClose} onRate={jest.fn()} />,
    );

    fireEvent.press(screen.getByText(/cancelar/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
