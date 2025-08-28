import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, View, Pressable, StyleSheet, SafeAreaView, useColorScheme } from 'react-native';

import { Colors } from '@constants/Colors';
import { useNotifications } from '@hooks/useNotifications';

import NotificationList from '@/components/notifications/NotificationList';
import RatingModal from '@/components/RatingModal';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { items, handleAccept, handleReject, handleRate, handleRead, markRead } =
    useNotifications();

  const [ratingVisible, setRatingVisible] = useState(false);
  const [selected, setSelected] = useState<{ uid: string; name: string; notifId: string } | null>(
    null,
  );

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  useFocusEffect(
    useCallback(() => {
      return () => {
        const toMark = items.filter((n) => n.unread && n.type === 'rechazado');
        if (toMark.length > 0) {
          Promise.all(toMark.map((n) => markRead(n.id))).catch((e) =>
            console.error('Auto mark rejected notifications failed:', e),
          );
        }
      };
    }, [items, markRead]),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.buttonSecondary,
            }}
          >
            <Ionicons name="chevron-back" size={22} color={C.buttonSecondaryText} />
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.title }}>Notificaciones</Text>
        </View>

        <NotificationList
          items={items}
          onAcceptRequest={handleAccept}
          onRejectRequest={handleReject}
          onRateUser={(borrowerId, borrowerName, notifId) => {
            setSelected({ uid: borrowerId, name: borrowerName, notifId });
            setRatingVisible(true);
          }}
          onMarkRead={handleRead}
        />

        <RatingModal
          visible={ratingVisible}
          userName={selected?.name ?? ''}
          onClose={() => setRatingVisible(false)}
          onRate={(rating, comment) => {
            if (user?.uid && selected) {
              handleRate(user.uid, selected.uid, rating, selected.notifId, comment);
              setRatingVisible(false);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20, gap: 12 },
});
