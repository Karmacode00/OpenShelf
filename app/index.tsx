import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/home'); // dentro de (tabs)
      } else {
        router.replace('/login'); // dentro de (auth)
      }
    }
  }, [user, loading]);

  return null; // no muestra nada
}
