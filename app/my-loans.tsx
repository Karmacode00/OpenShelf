// app/loans.tsx (fragmentos clave)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

import BookListItem from '@/components/BookListItem';
import { useAuth } from '@/contexts/AuthContext';
import { getBookRepository } from '@/di/container';
import { cancelRequestUseCase } from '@/domain/usecases/cancelRequest';
import { listMyLoansUseCase } from '@/domain/usecases/listMyLoans';
import { returnBookUseCase } from '@/domain/usecases/returnBook';

export default function LoansScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const repo = useMemo(() => getBookRepository(), []);
  const listMyLoans = useMemo(() => listMyLoansUseCase(repo), [repo]);
  const cancelRequest = useMemo(() => cancelRequestUseCase(repo), [repo]);
  const returnBook = useMemo(() => returnBookUseCase(repo), [repo]);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({}); // 👈

  async function load() {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await listMyLoans(user.uid);
      setItems(data);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'No se pudieron cargar tus préstamos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user?.uid]);

  const setItemLoading = (id: string, v: boolean) =>
    setLoadingById((prev) => {
      const next = { ...prev };
      if (v) next[id] = true;
      else delete next[id];
      return next;
    });

  const handleCancel = async (bookId: string) => {
    if (!user?.uid) return;
    setItemLoading(bookId, true);
    try {
      await cancelRequest({ bookId, borrowerId: user.uid });
      setItems((prev) => prev.filter((b) => b.id !== bookId));
    } catch (e: any) {
      Alert.alert('No se pudo cancelar', e?.message ?? 'Intenta nuevamente');
    } finally {
      setItemLoading(bookId, false);
    }
  };

  const handleReturn = async (bookId: string) => {
    if (!user?.uid) return;
    setItemLoading(bookId, true);
    try {
      await returnBook({ bookId, borrowerId: user.uid });
      setItems((prev) => prev.filter((b) => b.id !== bookId));
    } catch (e: any) {
      Alert.alert('No se pudo devolver', e?.message ?? 'Intenta nuevamente');
    } finally {
      setItemLoading(bookId, false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isRequested = item.status === 'requested';
    const isLoaned = item.status === 'loaned';
    const isLoading = !!loadingById[item.id];

    const label = isRequested ? 'Cancelar solicitud' : isLoaned ? 'Devolver' : undefined;
    const onPress = isRequested
      ? () => handleCancel(item.id)
      : isLoaned
        ? () => handleReturn(item.id)
        : undefined;

    return (
      <BookListItem
        title={item.title}
        author={item.author}
        imageUrl={item.imageUrl}
        showActionButton={!!label}
        actionLabel={label}
        actionStatus={isLoading ? 'Loading' : isRequested ? 'Solicitado' : 'Devolver'}
        onActionPress={onPress}
      />
    );
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
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.title }}>Mis Préstamos</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={C.tint} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 4, paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: C.icon, marginTop: 24 }}>
                No tienes solicitudes o préstamos activos.
              </Text>
            }
            onRefresh={load}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
