import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { useNearbyBooks } from './useNearbyBooks';

import { useAuth } from '@/contexts/AuthContext';
import { getBookRepository } from '@/di/container';
import { Book } from '@/domain/entities/Book';
import { requestBookUseCase } from '@/domain/usecases/requestBook';

export function useSearch() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { user } = useAuth();
  const { books, loading, loadNearby } = useNearbyBooks();

  const [query, setQuery] = useState(q ?? '');
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());

  const requestBook = requestBookUseCase(getBookRepository());

  const runSearch = (searchText: string) => {
    if (!user?.uid) return;
    loadNearby(searchText.trim());
  };

  const handleRequest = async (item: Book) => {
    if (!user?.uid || item.status !== 'available' || requestingIds.has(item.id)) return;
    setRequestingIds((prev) => new Set(prev).add(item.id));
    try {
      await requestBook({ bookId: item.id, requesterId: user.uid });
    } catch (e) {
      console.error('Error al solicitar el libro:', e);
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
    if (queryFromParams) runSearch(queryFromParams);
  }, [q, user?.uid]);

  return {
    query,
    setQuery,
    results: books,
    isLoading: loading,
    requestingIds,
    runSearch,
    handleRequest,
  };
}
