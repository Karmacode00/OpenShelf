import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';

import { Colors } from '@constants/Colors';

import FeedbackOverlay from '@/components/FeedbackOverlay';

type FeedbackState = {
  visible: boolean;
  loading: boolean;
  success: boolean;
  error: boolean;
  message: string;
};

type ConfirmState = {
  visible: boolean;
  message: string;
  onConfirm?: () => void;
};

type FeedbackContextType = {
  showLoading: (msg?: string) => void;
  showSuccess: (msg?: string) => void;
  showError: (msg?: string) => void;
  hide: () => void;
  confirmAction: (message: string, onConfirm: () => void) => void;
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

  const [confirm, setConfirm] = useState<ConfirmState>({
    visible: false,
    message: '',
    onConfirm: undefined,
  });

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const showLoading = (msg = 'Procesando...') =>
    setState({ visible: true, loading: true, success: false, error: false, message: msg });

  const showSuccess = (msg = '¡Éxito!') => {
    setState({ visible: true, loading: false, success: true, error: false, message: msg });
    setTimeout(() => hide(), 1800);
  };

  const showError = (msg = 'Ocurrió un error') => {
    setState({ visible: true, loading: false, success: false, error: true, message: msg });
    setTimeout(() => hide(), 2000);
  };

  const hide = () => setState({ ...state, visible: false });

  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirm({ visible: true, message, onConfirm });
  };

  const handleConfirm = () => {
    confirm.onConfirm?.();
    setConfirm({ visible: false, message: '', onConfirm: undefined });
  };

  const handleCancel = () => {
    setConfirm({ visible: false, message: '', onConfirm: undefined });
  };

  return (
    <FeedbackContext.Provider value={{ showLoading, showSuccess, showError, hide, confirmAction }}>
      {children}
      <FeedbackOverlay
        visible={state.visible}
        loading={state.loading}
        success={state.success}
        error={state.error}
        message={state.message}
        onClose={hide}
      />

      <Modal transparent visible={confirm.visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: C.background }]}>
            <Text style={[styles.message, { color: C.textDark }]}>{confirm.message}</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={handleCancel}
                style={[styles.btn, { backgroundColor: C.buttonSecondary }]}
              >
                <Text style={{ color: C.buttonSecondaryText }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.btn, { backgroundColor: C.buttonPrimary }]}
              >
                <Text style={{ color: C.buttonPrimaryText }}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </FeedbackContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
