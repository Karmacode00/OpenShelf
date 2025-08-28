import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  useColorScheme,
  Pressable,
} from 'react-native';

import { Colors } from '@constants/Colors';

type Props = {
  visible: boolean;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  message?: string;
  onClose?: () => void;
};

export default function FeedbackOverlay({
  visible,
  loading,
  success,
  error,
  message,
  onClose,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  if (!visible) return null;

  const getIcon = () => {
    if (loading) return <ActivityIndicator size="large" color={C.accent} />;
    if (success) return <Ionicons name="checkmark-circle" size={48} color="green" />;
    if (error) return <Ionicons name="close-circle" size={48} color="red" />;
    return null;
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.box, { backgroundColor: C.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          {getIcon()}
          {message && <Text style={[styles.text, { color: C.text }]}>{message}</Text>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
