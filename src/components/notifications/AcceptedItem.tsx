import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import { useThemeColor } from '@hooks/useThemeColor';

import { NotifAceptado } from '@/types/notifications';

type Props = {
  item: NotifAceptado;
  onMarkRead: (id: string) => void;
};

export default function AcceptedItem({ item, onMarkRead }: Props) {
  const text = useThemeColor({}, 'textContrast');
  const { ownerEmail } = item.data;

  return (
    <Pressable onPress={() => onMarkRead(item.id)}>
      <NotificationItemBase unread={item.unread}>
        <Text style={[styles.title, { color: text }]}>{item.title}</Text>
        <Text style={[styles.body, { color: text }]}>{item.body}.</Text>
        <Text style={[styles.body, { color: text, marginTop: 4 }]}>
          Puedes ponerte en contacto en el email <Text style={styles.strong}>{ownerEmail}</Text>.
        </Text>
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
  strong: {
    fontWeight: '700',
  },
});
