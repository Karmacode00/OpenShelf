import React from 'react';
import { StyleSheet, Text } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import { useThemeColor } from '@hooks/useThemeColor';

import { NotifRechazado } from '@/types/notifications';

type Props = {
  item: NotifRechazado;
};

export default function RejectedItem({ item }: Props) {
  const text = useThemeColor({}, 'textContrast');

  return (
    <NotificationItemBase unread={item.unread}>
      <Text style={[styles.title, { color: text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: text }]}>{item.body}</Text>
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
});
