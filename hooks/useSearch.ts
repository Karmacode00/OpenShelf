// hooks/useSearch.ts
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { getBookRepository } from '@/di/container';
import { requestBookUseCase } from '@/domain/usecases/requestBook';
import { searchBooksUseCase } from '@/domain/usecases/searchBooks';

export type BookItem = {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  ownerId: string;
  status: 'available' | 'requested' | 'loaned';
  borrowerId?: string | null;
};

export function useSearch() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { user } = useAuth();

  const [query, setQuery] = useState(q ?? '');
  const [results, setResults] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());

  const bookRepository = useMemo(() => getBookRepository(), []);
  const searchBooks = useMemo(() => searchBooksUseCase(bookRepository), [bookRepository]);
  const requestBook = useMemo(() => requestBookUseCase(bookRepository), [bookRepository]);

  const runSearch = async (searchText: string) => {
    const trimmedQuery = searchText.trim();
    if (!trimmedQuery) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchBooks({ query: trimmedQuery, excludeOwnerId: user?.uid });
      setResults(data as BookItem[]);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      Alert.alert('Error', 'No se pudo realizar la búsqueda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (item: BookItem) => {
    if (!user?.uid || item.status !== 'available' || requestingIds.has(item.id)) {
      return;
    }

    const originalResults = results;
    setRequestingIds((prev) => new Set(prev).add(item.id));
    setResults((prev) =>
      prev.map((b) => (b.id === item.id ? { ...b, status: 'requested', borrowerId: user.uid } : b)),
    );

    try {
      await requestBook({ bookId: item.id, requesterId: user.uid });
    } catch (e: any) {
      console.error('Error al solicitar el libro:', e);
      Alert.alert('No se pudo solicitar', e?.message ?? 'Intenta nuevamente');
      setResults(originalResults);
    } finally {
      setRequestingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  useEffect(() => {
    const queryFromParams = (q ?? '').toString().trim();
    if (queryFromParams) {
      runSearch(queryFromParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, user?.uid]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    requestingIds,
    runSearch,
    handleRequest,
  };
}
