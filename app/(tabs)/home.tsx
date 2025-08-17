// app/(tabs)/home.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

import ActionCard from '@/components/ActionCard';
import NotificationBell from '@/components/NotificationBell';
import SearchBar from '@/components/SearchBar';

export default function HomeScreen() {
  const router = useRouter();

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

  return (
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
  );
}

const getStyles = (C: typeof Colors.light) =>
  StyleSheet.create({
    container: { padding: 20, paddingBottom: 32, gap: 12 },
    title: { fontSize: 24, fontWeight: '700', color: C.title, marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 4, marginBottom: 6 },
  });
