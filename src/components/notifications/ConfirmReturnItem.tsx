import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import InlineButton from '@/components/InlineButton';
import { useThemeColor } from '@hooks/useThemeColor';
import type { NotifConfirmarDevolucion } from '@/types/notifications';

type Props = {
  item: NotifConfirmarDevolucion;
  onConfirmReturn: (bookId: string, notificationId: string, confirmed: boolean) => void;
};

export default function ConfirmReturnItem({ item, onConfirmReturn }: Props) {
  const text = useThemeColor({}, 'textContrast');
  const { bookId } = item.data;

  return (
    <NotificationItemBase unread={item.unread}>
      <Text style={[styles.title, { color: text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: text }]}>{item.body}</Text>

      <View style={styles.actions}>
        <InlineButton
          label="Confirmar"
          variant="info"
          onPress={() => onConfirmReturn(bookId, item.id, true)}
        />
        <InlineButton
          label="Aún no"
          variant="danger"
          onPress={() => onConfirmReturn(bookId, item.id, false)}
        />
      </View>
    </NotificationItemBase>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 6, fontSize: 16 },
  body: { fontSize: 15 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 10 },
});
