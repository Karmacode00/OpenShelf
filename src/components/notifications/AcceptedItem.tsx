import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import NotificationItemBase from './NotificationItemBase';
import { useThemeColor } from '@hooks/useThemeColor';

import { NotifAceptado } from '@/types/notifications';

type Props = {
  item: NotifAceptado;
  onMarkRead?: (id: string) => void;
};

export default function AcceptedItem({ item, onMarkRead }: Props) {
  const text = useThemeColor({}, 'textContrast');
  const { ownerEmail } = item.data;

  return (
    <NotificationItemBase>
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>{item.title}</Text>
        {onMarkRead && (
          <Pressable onPress={() => onMarkRead(item.id)} hitSlop={8}>
            <Ionicons name="close" size={18} color={text} />
          </Pressable>
        )}
      </View>
      <Text style={[styles.body, { color: text }]}>{item.body}.</Text>
      <Text style={[styles.body, { color: text, marginTop: 4 }]}>
        Puedes ponerte en contacto en el email <Text style={styles.strong}>{ownerEmail}</Text>.
      </Text>
    </NotificationItemBase>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
  },
  body: {
    fontSize: 15,
  },
  strong: {
    fontWeight: '700',
  },
});
