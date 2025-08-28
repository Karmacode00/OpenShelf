import { useEffect, useMemo, useState } from 'react';

import { getUserRepository } from '@/di/container';
import { getUserRatingScoreUseCase } from '@/domain/usecases/getUserRatingScore';

export function useUserRating(userId: string | null) {
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const repo = useMemo(() => getUserRepository(), []);
  const getUserRatingScore = useMemo(() => getUserRatingScoreUseCase(repo), [repo]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    setLoading(true);

    (async () => {
      try {
        const score = await getUserRatingScore(userId);
        if (isMounted) setRating(score);
      } catch (err) {
        console.error('Error obteniendo rating de usuario:', err);
        if (isMounted) setRating(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId, getUserRatingScore]);

  return { rating, loading };
}
