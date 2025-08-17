import { Ionicons } from '@expo/vector-icons';
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@hooks/useThemeColor';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';

type Props = { onPress?: () => void };

export default function NotificationBell({ onPress }: Props) {
  const { user } = useAuth();
  const bg = useThemeColor({}, 'buttonSecondary');
  const fg = useThemeColor({}, 'buttonSecondaryText');

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      where('unread', '==', true),
      limit(1),
    );
    const unsub = onSnapshot(q, (snap) => setHasUnread(!snap.empty));
    return unsub;
  }, [user?.uid]);

  return (
    <Pressable onPress={onPress} style={[styles.btn, { backgroundColor: fg }]} hitSlop={10}>
      <Ionicons name="notifications-outline" size={20} color={bg} />
      {hasUnread && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935', // rojo para el badge
  },
});
