import React from 'react';
import { Text, StyleSheet } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import { useThemeColor } from '@hooks/useThemeColor';

import InlineButton from '@/components/InlineButton';
import { NotifDevuelto } from '@/types/notifications';

type Props = {
  item: NotifDevuelto;
  onRateUser: (borrowerId: string, borrowerName: string) => void;
};

export default function ReturnedItem({ item, onRateUser }: Props) {
  const text = useThemeColor({}, 'textContrast');
  const { borrowerId, userName } = item.data;

  return (
    <NotificationItemBase unread={item.unread}>
      <Text style={[styles.title, { color: text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: text }]}>{item.body}</Text>
      <InlineButton
        label="Calificar usuario"
        variant="info"
        onPress={() => onRateUser(borrowerId, userName)}
        style={{ marginTop: 10 }}
      />
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
});
