// app/my-books.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

import BookListItem from '@/components/BookListItem';
import { useAuth } from '@/contexts/AuthContext';
import { getBookRepository } from '@/di/container';
import { listMyBooksUseCase } from '@/domain/usecases/listMyBooks';

// type Filter = 'all' | 'due';

export default function MyBooksScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  //   const [filter, setFilter] = useState<Filter>('all');
  const [books, setBooks] = useState<
    { id: string; title: string; author: string; imageUrl: string }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    const getByOwner = listMyBooksUseCase(getBookRepository());
    (async () => {
      try {
        const data = await getByOwner(user!.uid);
        if (mounted) setBooks(data);
      } catch (e: any) {
        console.error('Error listando libros', e?.message ?? e);
        Alert.alert('Error', 'No se pudieron cargar tus libros.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  const visible = useMemo(() => {
    // if (filter === 'all') return books;
    // 'Por vencer': ejemplo simple, próximos 7 días
    // const now = Date.now();
    // const seven = 7 * 24 * 60 * 60 * 1000;
    // return books.filter(
    //   (b) => b.dueDate && b.dueDate.getTime() - now <= seven && b.dueDate.getTime() - now >= 0,
    // );
    return books;
  }, [books]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <View style={{ padding: 20, gap: 16, flex: 1 }}>
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
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.title }}>Mis Libros</Text>
        </View>

        {/* <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => setFilter('all')}
            style={[
              styles.chip,
              { backgroundColor: filter === 'all' ? C.buttonPrimary : C.buttonSecondary },
            ]}
          >
            <Text style={{ color: C.textContrast, fontWeight: '700' }}>Todos</Text>
          </Pressable>

          <Pressable
            onPress={() => setFilter('due')}
            style={[
              styles.chip,
              { backgroundColor: filter === 'due' ? C.buttonPrimary : C.buttonSecondary },
            ]}
          >
            <Text style={{ color: C.textContrast, fontWeight: '700' }}>Por vencer</Text>
          </Pressable>
        </View> */}

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={C.tint} />
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 4, gap: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <BookListItem title={item.title} author={item.author} imageUrl={item.imageUrl} />
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: C.icon, marginTop: 24 }}>
                Aún no has publicado libros.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
