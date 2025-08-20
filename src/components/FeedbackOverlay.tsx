import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Colors } from '@constants/Colors';

type Props = {
  visible: boolean;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  message?: string;
};

export default function FeedbackOverlay({ visible, loading, success, error, message }: Props) {
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
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: C.surface }]}>
          {getIcon()}
          <Text style={[styles.text, { color: C.text }]}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
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
