// app/my-books.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

import BookListItem from '@/components/BookListItem';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getBookRepository } from '@/di/container';
import { Book } from '@/domain/entities/Book';
import { deleteBookUseCase } from '@/domain/usecases/deleteBook';
import { listMyBooksUseCase } from '@/domain/usecases/listMyBooks';

export default function MyBooksScreen() {
  const router = useRouter();
  const { confirmAction, showLoading, showSuccess, showError } = useFeedback();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);

  const repo = useMemo(() => getBookRepository(), []);
  const listMyBooks = useMemo(() => listMyBooksUseCase(repo), [repo]);
  const deleteBook = useMemo(() => deleteBookUseCase(repo), [repo]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listMyBooks(user!.uid);
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
  }, [listMyBooks, user?.uid]);

  const visible = useMemo(() => {
    return books;
  }, [books]);

  const confirmAndDelete = (itemId: string) => {
    confirmAction('¿Quieres eliminar este libro?', async () => {
      try {
        showLoading('Eliminando...');
        await deleteBook(itemId, user!.uid);
        setBooks((prev) => prev.filter((b) => b.id !== itemId));
        showSuccess('¡Libro eliminado!');
      } catch (e: any) {
        console.error('Error al eliminar libro:', e?.message ?? e);
        showError(typeof e?.message === 'string' ? e.message : 'No se pudo eliminar el libro');
      }
    });
  };

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
              <BookListItem
                title={item.title}
                author={item.author}
                imageUrl={item.imageUrl}
                canDelete={item.status === 'available'}
                onDeletePress={() => confirmAndDelete(item.id)}
                showDeleteButton
              />
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
