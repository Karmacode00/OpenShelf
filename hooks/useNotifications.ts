import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useEffect, useState, useMemo, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getBookRepository, getUserRepository } from '@/di/container';
import { acceptRequestUseCase } from '@/domain/usecases/acceptRequest';
import { rateUserUseCase } from '@/domain/usecases/rateUser';
import { rejectRequestUseCase } from '@/domain/usecases/rejectRequest';
import { db } from '@/services/firebase';
import { AppNotification } from '@/types/notifications';

export function useNotifications() {
  const { user } = useAuth();
  const { showLoading, showSuccess, showError, hide } = useFeedback();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const repo = useMemo(() => getBookRepository(), []);
  const userRepo = useMemo(() => getUserRepository(), []);
  const acceptRequest = useMemo(() => acceptRequestUseCase(repo), [repo]);
  const rejectRequest = useMemo(() => rejectRequestUseCase(repo), [repo]);
  const rateUser = useMemo(() => rateUserUseCase(userRepo), [userRepo]);

  const markRead = useCallback(
    async (id: string) => {
      if (!user?.uid) return;
      await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { unread: false });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    },
    [user?.uid],
  );

  const markReadSilent = useCallback(
    async (id: string) => {
      if (!user?.uid) return;
      await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { unread: false });
    },
    [user?.uid],
  );

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const qRef = query(
        collection(db, 'users', user.uid, 'notifications'),
        where('unread', '==', true),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(qRef);

      const rawItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification);

      const validated = await Promise.all(
        rawItems.map(async (notif) => {
          if (notif.type === 'solicitud' && notif.data?.bookId) {
            const bookRef = doc(db, 'books', notif.data.bookId);
            const bookSnap = await getDoc(bookRef);
            if (!bookSnap.exists()) {
              await markReadSilent(notif.id);
              return null;
            }
            const b = bookSnap.data() as any;

            if (b.status !== 'requested' || !b.currentLoanId) {
              await markReadSilent(notif.id);
              return null;
            }

            const loanRef = doc(db, 'books', notif.data.bookId, 'loans', b.currentLoanId);
            const loanSnap = await getDoc(loanRef);
            if (!loanSnap.exists()) {
              await markReadSilent(notif.id);
              return null;
            }
            const l = loanSnap.data() as any;
            const ok = l.status === 'requested' && !!l.active;
            if (!ok) {
              await markReadSilent(notif.id);
              return null;
            }
          }
          return notif;
        }),
      );

      setItems(validated.filter(Boolean) as AppNotification[]);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      showError('No se pudieron cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, showError, markReadSilent]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (bookId: string, notifId: string) => {
    if (!user?.uid) return;
    showLoading('');
    try {
      await acceptRequest({ bookId, ownerId: user.uid });
      await markRead(notifId);
      showSuccess('Solicitud aceptada');
      await load();
    } catch (e) {
      console.error(e);
      showError('No se pudo aceptar');
    } finally {
      hide();
    }
  };

  const handleReject = async (bookId: string, notifId: string) => {
    if (!user?.uid) return;
    showLoading('');
    try {
      await rejectRequest({ bookId, ownerId: user.uid });
      await markRead(notifId);
      showSuccess('Solicitud rechazada');
      await load();
    } catch (e) {
      console.error(e);
      showError('No se pudo rechazar');
    } finally {
      hide();
    }
  };

  const handleRate = async (
    raterId: string,
    ratedId: string,
    rating: number,
    notifId: string,
    comment?: string,
  ) => {
    showLoading('Enviando calificación...');
    try {
      await rateUser(raterId, ratedId, rating, comment);
      await markRead(notifId);
      showSuccess('¡Calificación enviada!');
      await load();
    } catch (e) {
      console.error(e);
      showError('Error al calificar');
    } finally {
      hide();
    }
  };

  const handleRead = async (id: string) => {
    showLoading('');
    try {
      await markRead(id);
      await load();
    } catch (e) {
      console.error(e);
      showError('No se pudo marcar como leído');
    } finally {
      hide();
    }
  };

  return {
    items,
    loading,
    load,
    markRead,
    handleAccept,
    handleReject,
    handleRate,
    handleRead,
  };
}
