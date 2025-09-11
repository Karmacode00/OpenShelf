import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getBookRepository } from '@/di/container';
import { cancelRequestUseCase } from '@/domain/usecases/cancelRequest';
import { listMyLoansUseCase, LoanWithBook } from '@/domain/usecases/listMyLoans';
import { requestReturnBookUseCase } from '@/domain/usecases/requestReturnBook';

export function useLoans() {
  const { user } = useAuth();
  const { showLoading, showSuccess, showError, hide, confirmAction } = useFeedback();

  const repo = useMemo(() => getBookRepository(), []);
  const listMyLoans = useMemo(() => listMyLoansUseCase(repo), [repo]);
  const cancelRequest = useMemo(() => cancelRequestUseCase(repo), [repo]);
  const returnBook = useMemo(() => requestReturnBookUseCase(repo), [repo]);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LoanWithBook[]>([]);
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const rows = await listMyLoans(user!.uid, { activeOnly: true, limit: 50 });
      setItems(rows);
    } catch (err) {
      console.error(err);
      showError('No se pudieron cargar tus préstamos.');
    } finally {
      setLoading(false);
    }
  };

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

  const doCancel = async (bookId: string) => {
    if (!user?.uid) return;
    setItemLoading(bookId, true);
    try {
      showLoading('');
      await cancelRequest({ bookId, borrowerId: user.uid });
      setItems((prev) => prev.filter((b) => b.id !== bookId));
      showSuccess('Solicitud cancelada');
    } catch (e: any) {
      console.error(e);
      showError(e?.message ?? 'No se pudo cancelar');
    } finally {
      setItemLoading(bookId, false);
    }
  };

  const doReturn = async (bookId: string) => {
    if (!user?.uid) return;
    setItemLoading(bookId, true);
    try {
      showLoading('');
      await returnBook({ bookId, borrowerId: user.uid });
      setItems((prev) => prev.filter((b) => b.id !== bookId));
      showSuccess('Notificación enviada');
    } catch (e: any) {
      console.error(e);
      showError(e?.message ?? 'No se pudo notificar al dueño');
    } finally {
      setItemLoading(bookId, false);
    }
  };

  const handleCancel = (bookId: string) => {
    confirmAction('¿Quieres cancelar esta solicitud?', () => {
      doCancel(bookId).then(() => load());
    });
  };

  const handleReturn = (bookId: string) => {
    confirmAction('¿Quieres devolver este libro?', () => {
      doReturn(bookId).then(() => load());
    });
  };

  return {
    items,
    loading,
    loadingById,
    load,
    handleCancel,
    handleReturn,
  };
}
