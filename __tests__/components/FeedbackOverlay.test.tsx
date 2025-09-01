import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator, Pressable } from 'react-native';

import FeedbackOverlay from '@/components/FeedbackOverlay';

describe('FeedbackOverlay', () => {
  it('cuando visible=false → no renderiza nada', () => {
    const { toJSON } = render(<FeedbackOverlay visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('loading=true → muestra ActivityIndicator y el mensaje', () => {
    const { UNSAFE_getByType } = render(<FeedbackOverlay visible loading message="Cargando..." />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByTestId('icon')).toBeNull();
    expect(screen.getByText(/cargando/i)).toBeTruthy();
  });

  it('success=true → muestra icono y el mensaje', () => {
    render(<FeedbackOverlay visible success message="Listo" />);
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText(/listo/i)).toBeTruthy();
  });

  it('error=true → muestra icono y el mensaje', () => {
    render(<FeedbackOverlay visible error message="Falló" />);
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText(/falló/i)).toBeTruthy();
  });

  it('clic en overlay llama onClose; clic dentro NO llama onClose (stopPropagation)', () => {
    const onClose = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <FeedbackOverlay visible message="Hola" onClose={onClose} />,
    );

    const [overlay, innerBox] = UNSAFE_getAllByType(Pressable);

    fireEvent.press(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);

    const stopPropagation = jest.fn();
    fireEvent(innerBox, 'press', { stopPropagation });
    expect(stopPropagation).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sin message → no renderiza texto de mensaje', () => {
    render(<FeedbackOverlay visible success />);
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.queryByText(/No pudimos obtener tu ubicación|Cargando mapa/i)).toBeNull();
  });
});
