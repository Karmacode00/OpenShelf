import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';
import { useLoans } from '@hooks/useLoans';

import BookListItem from '@/components/BookListItem';
import { LoanWithBook } from '@/domain/usecases/listMyLoans';

export default function LoansScreen() {
  const router = useRouter();
  const { items, loading, loadingById, handleCancel, handleReturn, load } = useLoans();

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const renderItem = ({ item }: { item: LoanWithBook }) => {
    const isRequested = item.status === 'requested';
    const isLoaned = item.status === 'loaned';
    const isLoading = !!loadingById[item.id];

    const label = isRequested ? 'Cancelar solicitud' : isLoaned ? 'Devolver' : undefined;
    const onPress = isRequested
      ? () => handleCancel(item.book.id)
      : isLoaned
        ? () => handleReturn(item.book.id)
        : undefined;

    return (
      <BookListItem
        title={item.book.title}
        author={item.book.author}
        imageUrl={item.book.imageUrl}
        showActionButton={!!label}
        actionLabel={label}
        actionStatus={isLoading ? 'Loading' : isRequested ? 'Pendiente' : 'Devolver'}
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
