import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import { useThemeColor } from '@hooks/useThemeColor';

import { NotifRechazado } from '@/types/notifications';

type Props = {
  item: NotifRechazado;
  onMarkRead: (id: string) => void;
};

export default function RejectedItem({ item, onMarkRead }: Props) {
  const text = useThemeColor({}, 'textContrast');

  return (
    <Pressable onPress={() => onMarkRead(item.id)}>
      <NotificationItemBase unread={item.unread}>
        <Text style={[styles.title, { color: text }]}>{item.title}</Text>
        <Text style={[styles.body, { color: text }]}>{item.body}</Text>
      </NotificationItemBase>
    </Pressable>
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
});
