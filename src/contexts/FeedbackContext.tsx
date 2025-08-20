import React, { createContext, useContext, useState, ReactNode } from 'react';

import FeedbackOverlay from '@/components/FeedbackOverlay';

type FeedbackState = {
  visible: boolean;
  loading: boolean;
  success: boolean;
  error: boolean;
  message: string;
};

type FeedbackContextType = {
  showLoading: (msg?: string) => void;
  showSuccess: (msg?: string) => void;
  showError: (msg?: string) => void;
  hide: () => void;
};

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('FeedbackProvider no está inicializado');
  return ctx;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FeedbackState>({
    visible: false,
    loading: false,
    success: false,
    error: false,
    message: '',
  });

  const showLoading = (msg = 'Procesando...') =>
    setState({ visible: true, loading: true, success: false, error: false, message: msg });

  const showSuccess = (msg = '¡Éxito!') =>
    setState({ visible: true, loading: false, success: true, error: false, message: msg });

  const showError = (msg = 'Ocurrió un error') =>
    setState({ visible: true, loading: false, success: false, error: true, message: msg });

  const hide = () => setState({ ...state, visible: false });

  return (
    <FeedbackContext.Provider value={{ showLoading, showSuccess, showError, hide }}>
      {children}
      <FeedbackOverlay
        visible={state.visible}
        loading={state.loading}
        success={state.success}
        error={state.error}
        message={state.message}
      />
    </FeedbackContext.Provider>
  );
}
