// app/(tabs)/home.tsx
import { useRouter } from 'expo-router';
import { onSnapshot, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

import ActionCard from '@/components/ActionCard';
import LocationModal from '@/components/LocationModal';
import NotificationBell from '@/components/NotificationBell';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showLocModal, setShowLocModal] = useState(false);

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

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const data = snap.data() as any;
      const hasLocation = !!data?.location?.latitude && !!data?.location?.longitude;
      setShowLocModal(!hasLocation);
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
      <LocationModal
        visible={showLocModal}
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
    sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 4, marginBottom: 6 },
  });
