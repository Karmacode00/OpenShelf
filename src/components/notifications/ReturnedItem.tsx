import React from 'react';
import { Text, StyleSheet } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import { useThemeColor } from '@hooks/useThemeColor';

import InlineButton from '@/components/InlineButton';
import { NotifDevuelto, NotifDevueltoBorrower } from '@/types/notifications';

type Props = {
  item: NotifDevuelto | NotifDevueltoBorrower;
  onRateUser: (targetId: string, targetName: string) => void;
  resolveTarget?: (item: any) => { id: string; name: string };
};

export default function ReturnedItem({ item, onRateUser, resolveTarget }: Props) {
  const text = useThemeColor({}, 'textContrast');

  const fallback = {
    id: 'borrowerId' in item.data ? item.data.borrowerId : item.data.ownerId,
    name: 'userName' in item.data ? item.data.userName : item.data.ownerName,
  };
  const target = resolveTarget ? resolveTarget(item) : fallback;

  return (
    <NotificationItemBase unread={item.unread}>
      <Text style={[styles.title, { color: text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: text }]}>{item.body}</Text>
      <InlineButton
        label="Calificar usuario"
        variant="info"
        onPress={() => onRateUser(target.id, target.name)}
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
