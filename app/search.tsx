// app/search.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useSearch, BookItem } from '@hooks/useSearch';

import BookListItem from '@/components/BookListItem';
import SearchBar from '@/components/SearchBar';

export default function SearchScreen() {
  const router = useRouter();
  const { query, setQuery, results, isLoading, requestingIds, runSearch, handleRequest } =
    useSearch();

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const getActionStatus = (item: BookItem) => {
    if (requestingIds.has(item.id)) return 'Loading';
    return item.status === 'requested' ? 'Solicitado' : 'Solicitar';
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
              overflow: 'hidden',
            }}
          >
            <Ionicons name="chevron-back" size={22} color={C.buttonSecondaryText} />
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.title }}>Búsqueda</Text>
        </View>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={() => runSearch(query)}
          placeholder="Buscar por título o autor"
        />

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={C.tint} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <BookListItem
                title={item.title}
                author={item.author}
                imageUrl={item.imageUrl}
                showActionButton
                actionStatus={getActionStatus(item)}
                onActionPress={() => handleRequest(item)}
              />
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: C.icon }]}>
                {query.trim() ? 'Sin resultados.' : 'Escribe algo para buscar.'}
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20, gap: 12 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingVertical: 16, gap: 12 },
  emptyText: { textAlign: 'center', marginTop: 24 },
});
