import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import { useThemeColor } from '@hooks/useThemeColor';

import InlineButton from '@/components/InlineButton';
import { NotifSolicitud } from '@/types/notifications';

type Props = {
  item: NotifSolicitud;
  onAccept: (bookId: string, notificationId: string) => void;
  onReject: (bookId: string, notificationId: string) => void;
};

export default function RequestItem({ item, onAccept, onReject }: Props) {
  const text = useThemeColor({}, 'textContrast');
  const notificationId = item.id;
  const { bookId } = item.data;

  return (
    <NotificationItemBase unread={item.unread}>
      <Text style={[styles.title, { color: text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: text }]}>{item.body}</Text>
      <View style={styles.actions}>
        <InlineButton label="Aceptar" onPress={() => onAccept(bookId, notificationId)} />
        <InlineButton
          label="Rechazar"
          variant="danger"
          onPress={() => onReject(bookId, notificationId)}
        />
      </View>
    </NotificationItemBase>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 16,
  },
  body: {
    fontSize: 15,
  },
  bold: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
});
