import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, orderBy, query, updateDoc, doc, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, Pressable, StyleSheet, SafeAreaView, useColorScheme } from 'react-native';

import { Colors } from '@constants/Colors';

import NotificationList from '@/components/notifications/NotificationList';
import RatingModal from '@/components/RatingModal';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getBookRepository, getUserRepository } from '@/di/container';
import { acceptRequestUseCase } from '@/domain/usecases/acceptRequest';
import { rateUserUseCase } from '@/domain/usecases/rateUser';
import { rejectRequestUseCase } from '@/domain/usecases/rejectRequest';
import { db } from '@/services/firebase';
import { AppNotification } from '@/types/notifications';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { showLoading, showSuccess, showError, hide } = useFeedback();
  const [items, setItems] = useState<AppNotification[]>([]);

  const [ratingVisible, setRatingVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const repo = useMemo(() => getBookRepository(), []);
  const userRepo = useMemo(() => getUserRepository(), []);
  const acceptRequest = useMemo(() => acceptRequestUseCase(repo), [repo]);
  const rejectRequest = useMemo(() => rejectRequestUseCase(repo), [repo]);
  const rateUser = useMemo(() => rateUserUseCase(userRepo), [userRepo]);

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const load = async () => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      where('unread', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification));
  };

  useEffect(() => {
    load();
  }, [user?.uid]);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'users', user!.uid, 'notifications', id), { unread: false });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const handleAcceptRequest = async (bookId: string, notificationId: string) => {
    try {
      if (!user?.uid) return;
      await acceptRequest({ bookId, ownerId: user.uid });
      await markRead(notificationId);
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
    }
  };

  const handleRejectRequest = async (bookId: string, notificationId: string) => {
    try {
      if (!user?.uid) return;
      await rejectRequest({ bookId, ownerId: user.uid });
      await markRead(notificationId);
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
    }
  };

  const handleRateUser = async (borrowerId: string, borrowerName: string) => {
    setSelectedUserId(borrowerId);
    setSelectedUserName(borrowerName);
    setRatingVisible(true);
  };

  const handleSubmitRating = async (rating: number) => {
    if (!user?.uid || !selectedUserId) return;

    try {
      showLoading('Enviando calificación...');
      await rateUser(user.uid, selectedUserId, rating);
      showSuccess('¡Calificación enviada!');
      setTimeout(hide, 1800);
      setRatingVisible(false);
      setSelectedUserId(null);
      setSelectedUserName('');
      load();
    } catch (err) {
      console.error('Error al enviar calificación:', err);
      showError('Ocurrió un error al calificar');
      setTimeout(hide, 2000);
    }
  };

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
          onMarkRead={markRead}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onRateUser={(borrowerId, borrowerName) => handleRateUser(borrowerId, borrowerName)}
        />

        <RatingModal
          visible={ratingVisible}
          userName={selectedUserName}
          onClose={() => setRatingVisible(false)}
          onRate={handleSubmitRating}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20, gap: 12 },
});
