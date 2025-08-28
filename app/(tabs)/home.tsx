import { useRouter } from 'expo-router';
import { onSnapshot, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';
import { useNearbyBooks } from '@hooks/useNearbyBooks';
import { useSearch } from '@hooks/useSearch';

import ActionCard from '@/components/ActionCard';
import BookListItem from '@/components/BookListItem';
import LocationModal from '@/components/LocationModal';
import MapPicker from '@/components/MapPicker';
import NotificationBell from '@/components/NotificationBell';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { Book } from '@/domain/entities/Book';
import { db } from '@/services/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { confirmAction, showLoading, showSuccess, showError } = useFeedback();
  const { handleRequest } = useSearch();

  const [loadingUser, setLoadingUser] = useState(true);
  const [showLocModal, setShowLocModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<
    (Book & { distanceKm: number; ownerRating?: number; ownerName?: string }) | null
  >(null);

  const { books, loading, userLoc, loadNearby } = useNearbyBooks();

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const s = getStyles(C);

  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setQuery('');
    Keyboard.dismiss();
  };

  const getActionStatus = (item: Book) => {
    return item.status === 'requested' ? 'Pendiente' : 'Solicitar';
  };

  const confirmAndRequest = (item: Book) => {
    confirmAction('¿Quieres solicitar este libro?', async () => {
      try {
        showLoading('Solicitando...');
        await handleRequest(item);
        showSuccess('¡Solicitud enviada!');
      } catch {
        showError('No se pudo solicitar el libro');
      }
    });
  };

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const data = snap.data() as any;
      const hasLocation = !!data?.location?.latitude && !!data?.location?.longitude;
      setShowLocModal(!hasLocation);
      setLoadingUser(false);

      if (hasLocation) {
        loadNearby();
      }
    });
    return unsub;
  }, [user?.uid]);

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
        <ScrollView contentContainerStyle={s.container}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={s.title}>Explorar</Text>
            <NotificationBell onPress={() => router.push('/notifications')} />
          </View>

          <View style={{ marginBottom: 20 }}>
            <SearchBar value={query} onChangeText={setQuery} onSubmit={handleSearch} />
          </View>

          {loading ? (
            <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={C.tint} />
            </View>
          ) : (
            userLoc &&
            books.length > 0 && (
              <MapPicker
                region={{
                  latitude: userLoc.latitude,
                  longitude: userLoc.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                hasList
                autoFit={false}
                markers={books.map((b) => ({
                  id: b.id,
                  latitude: b.location.latitude!,
                  longitude: b.location.longitude!,
                  title: b.title,
                  description: b.author,
                  pinColor: 'navy',
                  onPress: () => setSelectedBook(b),
                }))}
              />
            )
          )}

          <Text style={s.sectionTitle}>Acciones rápidas</Text>
          <View style={{ gap: 12 }}>
            <ActionCard
              title="Agregar libro"
              subtitle="Publica un nuevo libro para préstamo"
              icon="book"
              onPress={() => router.push('/add-book')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={!!selectedBook}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedBook(null)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setSelectedBook(null)}>
          <View style={[s.sheet, { backgroundColor: C.card }]}>
            {selectedBook && (
              <BookListItem
                title={selectedBook.title}
                author={selectedBook.author}
                imageUrl={selectedBook.imageUrl}
                distanceKm={selectedBook.distanceKm}
                ownerRating={selectedBook.ownerRating}
                ownerName={selectedBook.ownerName}
                showActionButton
                actionStatus={getActionStatus(selectedBook)}
                onActionPress={() => {
                  confirmAndRequest(selectedBook);
                  setSelectedBook(null);
                }}
              />
            )}
          </View>
        </Pressable>
      </Modal>

      <LocationModal
        visible={!loadingUser && showLocModal}
        userId={user!.uid}
        onClose={() => setShowLocModal(false)}
        onSaved={() => setShowLocModal(false)}
      />
    </>
  );
}

const getStyles = (C: typeof Colors.light) =>
  StyleSheet.create({
    container: { padding: 20, paddingBottom: 32, gap: 12 },
    title: { fontSize: 24, fontWeight: '700', color: C.title, marginBottom: 8 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: C.textDark,
      marginTop: 4,
      marginBottom: 6,
    },
    mapWrap: {
      height: 220,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: '#00000055',
      justifyContent: 'flex-end',
    },
    sheet: {
      padding: 20,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
  });
