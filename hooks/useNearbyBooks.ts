import { getDoc, doc } from 'firebase/firestore';
import { useMemo, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getBookRepository, getUserRepository } from '@/di/container';
import { Book } from '@/domain/entities/Book';
import { getUserLocationUseCase } from '@/domain/usecases/getUserLocation';
import { searchNearbyBooksUseCase } from '@/domain/usecases/searchNearbyBooks';
import { db } from '@/services/firebase';

type OwnerInfo = {
  displayName?: string;
  rating?: number;
};

async function fetchOwnersInfoMap(ownerIds: string[]): Promise<Record<string, OwnerInfo>> {
  const unique = Array.from(new Set(ownerIds));
  const refs = unique.map((id) => doc(db, 'users', id));
  const snaps = await Promise.all(refs.map((r) => getDoc(r)));

  const map: Record<string, OwnerInfo> = {};
  for (const snap of snaps) {
    if (!snap.exists()) continue;
    const d = snap.data() as any;
    const total = d?.rating?.total ?? 0;
    const count = d?.rating?.count ?? 0;
    map[snap.id] = {
      displayName: d?.displayName,
      rating: total > 0 && count > 0 ? total / count : undefined,
    };
  }
  return map;
}

export function useNearbyBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<
    (Book & { distanceKm: number; ownerRating?: number; ownerName?: string })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  const ownersCacheRef = useRef<Map<string, OwnerInfo>>(new Map());

  const bookRepo = useMemo(() => getBookRepository(), []);
  const userRepo = useMemo(() => getUserRepository(), []);
  const searchBooks = useMemo(() => searchNearbyBooksUseCase(bookRepo), [bookRepo]);
  const getUserLocation = useMemo(() => getUserLocationUseCase(userRepo), [userRepo]);

  const loadNearby = async (queryText?: string) => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const loc = await getUserLocation(user.uid);
      if (!loc) return;

      setUserLoc({ latitude: loc.latitude, longitude: loc.longitude });

      const data = await searchBooks({
        center: { latitude: loc.latitude, longitude: loc.longitude },
        radiusKm: 5,
        excludeOwnerId: user.uid,
        limit: 30,
        queryText,
      });

      const neededOwnerIds = Array.from(
        new Set(data.map((b) => b.ownerId).filter((id) => !ownersCacheRef.current.has(id))),
      );

      if (neededOwnerIds.length > 0) {
        try {
          const fetched = await fetchOwnersInfoMap(neededOwnerIds);
          for (const [id, info] of Object.entries(fetched)) {
            ownersCacheRef.current.set(id, info);
          }
        } catch (e) {
          console.error('Error al obtener información de dueños:', e);
        }
      }

      const enriched = data.map((b) => {
        const info = ownersCacheRef.current.get(b.ownerId);
        return {
          ...b,
          ownerRating: info?.rating,
          ownerName: info?.displayName,
        };
      });

      setBooks(enriched);
    } catch (err) {
      console.error('Error al cargar libros cercanos:', err);
    } finally {
      setLoading(false);
    }
  };

  return { books, loading, userLoc, loadNearby };
}
