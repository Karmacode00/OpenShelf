import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

import { FeedbackProvider, useFeedback } from '@/contexts/FeedbackContext';

function Testbed({ onConfirmed = jest.fn() }: { onConfirmed?: () => void }) {
  const fb = useFeedback();

  return (
    <View>
      <Pressable testID="btn-loading" onPress={() => fb.showLoading()} />
      <Pressable testID="btn-success" onPress={() => fb.showSuccess('OK!')} />
      <Pressable testID="btn-error" onPress={() => fb.showError('UPS')} />
      <Pressable testID="btn-hide" onPress={() => fb.hide()} />
      <Pressable
        testID="btn-confirm"
        onPress={() => fb.confirmAction('¿Seguro que deseas continuar?', onConfirmed)}
      />
      <Text>dummy</Text>
    </View>
  );
}

describe('FeedbackContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  function renderWithProvider(ui: React.ReactElement) {
    return render(<FeedbackProvider>{ui}</FeedbackProvider>);
  }

  it('showLoading → muestra overlay con mensaje por defecto', () => {
    renderWithProvider(<Testbed />);

    fireEvent.press(screen.getByTestId('btn-loading'));

    expect(screen.getByText(/procesando/i)).toBeTruthy();
  });

  it('showSuccess → muestra mensaje y se oculta automáticamente', () => {
    renderWithProvider(<Testbed />);

    fireEvent.press(screen.getByTestId('btn-success'));
    expect(screen.getByText('OK!')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('OK!')).toBeNull();
  });

  it('showError → muestra mensaje y se oculta automáticamente', () => {
    renderWithProvider(<Testbed />);

    fireEvent.press(screen.getByTestId('btn-error'));
    expect(screen.getByText('UPS')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2200);
    });

    expect(screen.queryByText('UPS')).toBeNull();
  });

  it('hide → oculta overlay si estaba visible', () => {
    renderWithProvider(<Testbed />);

    fireEvent.press(screen.getByTestId('btn-loading'));
    expect(screen.getByText(/procesando/i)).toBeTruthy();

    fireEvent.press(screen.getByTestId('btn-hide'));
    expect(screen.queryByText(/procesando/i)).toBeNull();
  });

  it('confirmAction → muestra modal; Confirmar llama callback y cierra; Cancelar solo cierra', () => {
    const onConfirmed = jest.fn();
    renderWithProvider(<Testbed onConfirmed={onConfirmed} />);

    fireEvent.press(screen.getByTestId('btn-confirm'));
    expect(screen.getByText(/¿seguro que deseas continuar\?/i)).toBeTruthy();

    fireEvent.press(screen.getByText(/confirmar/i));
    expect(onConfirmed).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/¿seguro que deseas continuar\?/i)).toBeNull();

    fireEvent.press(screen.getByTestId('btn-confirm'));
    expect(screen.getByText(/¿seguro que deseas continuar\?/i)).toBeTruthy();

    fireEvent.press(screen.getByText(/cancelar/i));
    expect(onConfirmed).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/¿seguro que deseas continuar\?/i)).toBeNull();
  });
});
