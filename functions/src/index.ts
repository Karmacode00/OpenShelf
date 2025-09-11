import * as admin from 'firebase-admin';
import { onDocumentUpdated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { geohashForLocation } from 'geofire-common';
import fetch from 'node-fetch';

type NotificationType =
  | 'solicitud'
  | 'aceptado'
  | 'rechazado'
  | 'devuelto'
  | 'confirma_devolucion'
  | 'rechaza_devolucion'
  | 'devuelto_borrower';

admin.initializeApp();

export const onBookRequested = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    if (!(before.status === 'available' && after.status === 'requested')) return;

    if (after.cancelledByBorrower) {
      await admin.firestore().doc(`books/${event.params.bookId}`).update({
        cancelledByBorrower: admin.firestore.FieldValue.delete(),
      });
    }

    const borrowerSnap = await admin.firestore().doc(`users/${after.borrowerId}`).get();
    const borrowerName = borrowerSnap.get('displayName') || 'Alguien';

    await sendUserNotification({
      userId: after.ownerId,
      title: 'Nueva solicitud de préstamo',
      body: `${borrowerName} quiere leer tu libro "${after.title}"`,
      data: {
        bookId: event.params.bookId,
        bookTitle: after.title,
        borrowerId: after.borrowerId,
        userName: borrowerName,
      },
      type: 'solicitud',
    });
  } catch (err) {
    console.error('[onBookRequested] Error:', err);
  }
});

export const onBookAccepted = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const isAccepted = before.status === 'requested' && after.status === 'loaned';
    if (!isAccepted) return;

    const ownerSnap = await admin.firestore().doc(`users/${after.ownerId}`).get();
    const ownerName = ownerSnap.get('displayName') || 'El dueño';
    const ownerEmail = ownerSnap.get('email') || 'sin correo';

    await sendUserNotification({
      userId: after.borrowerId,
      title: 'Solicitud aceptada',
      body: `${ownerName} aceptó prestarte "${after.title}"`,
      data: {
        bookId: event.params.bookId,
        bookTitle: after.title,
        ownerId: after.ownerId,
        ownerName,
        ownerEmail,
      },
      type: 'aceptado',
    });
  } catch (err) {
    console.error('[onBookAccepted] Error:', err);
  }
});

export const onBookRejected = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const isRejected =
      before.status === 'requested' &&
      after.status === 'available' &&
      before.borrowerId &&
      !after.borrowerId &&
      !after.cancelledByBorrower;
    if (!isRejected) return;

    await sendUserNotification({
      userId: before.borrowerId,
      title: 'Solicitud rechazada',
      body: `Tu solicitud por "${after.title}" fue rechazada.`,
      data: {
        bookId: event.params.bookId,
        bookTitle: after.title,
      },
      type: 'rechazado',
    });

    await admin
      .firestore()
      .collection('books')
      .doc(event.params.bookId)
      .update({ cancelledByBorrower: admin.firestore.FieldValue.delete() });
  } catch (err) {
    console.error('[onBookRejected] Error:', err);
  }
});

export const onReturnRequested = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const becamePending =
      before.status === 'loaned' && !before.returnRequested && after.returnRequested === true;
    if (!becamePending) return;

    const borrowerSnap = await admin.firestore().doc(`users/${after.borrowerId}`).get();
    const borrowerName = borrowerSnap.get('displayName') || 'El usuario';

    await sendUserNotification({
      userId: after.ownerId,
      title: 'Confirmar devolución',
      body: `${borrowerName} indica que devolvió "${after.title}". ¿Puedes confirmarlo?`,
      data: {
        bookId: event.params.bookId,
        bookTitle: after.title,
        borrowerId: after.borrowerId,
        userName: borrowerName,
      },
      type: 'confirma_devolucion',
    });
  } catch (err) {
    console.error('[onReturnRequested] Error:', err);
  }
});

export const onReturnRejected = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const wasPending = before.status === 'loaned' && !!before.returnRequested;
    const nowLoanedNoFlag = after.status === 'loaned' && !after.returnRequested;
    if (!(wasPending && nowLoanedNoFlag)) return;

    const ownerSnap = await admin.firestore().doc(`users/${after.ownerId}`).get();
    const ownerName = ownerSnap.get('displayName') || 'El dueño';

    await sendUserNotification({
      userId: before.borrowerId,
      title: 'Devolución rechazada',
      body: `${ownerName} indicó que aún no ha recibido "${after.title}". Continúa coordinando la entrega.`,
      data: {
        bookId: event.params.bookId,
        bookTitle: after.title,
        ownerId: after.ownerId,
        ownerName,
      },
      type: 'rechaza_devolucion',
    });
  } catch (err) {
    console.error('[onReturnRejected] Error:', err);
  }
});

export const onBookReturned = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const isConfirmedReturn =
      before.status === 'loaned' &&
      after.status === 'available' &&
      before.borrowerId &&
      !after.borrowerId &&
      before.returnRequested === true;

    if (!isConfirmedReturn) return;

    const borrowerSnap = await admin.firestore().doc(`users/${before.borrowerId}`).get();
    const borrowerName = borrowerSnap.get('displayName') || 'El usuario';

    const ownerSnap = await admin.firestore().doc(`users/${after.ownerId}`).get();
    const ownerName = ownerSnap.get('displayName') || 'El dueño';
    const ownerEmail = ownerSnap.get('email') || 'sin correo';

    await sendUserNotification({
      userId: after.ownerId,
      title: 'Libro devuelto',
      body: `${borrowerName} ha devuelto el libro "${after.title}". ¡Califica tu experiencia!`,
      data: {
        bookId: event.params.bookId,
        bookTitle: after.title,
        borrowerId: before.borrowerId,
        userName: borrowerName,
      },
      type: 'devuelto',
    });

    await sendUserNotification({
      userId: before.borrowerId,
      title: 'Gracias por devolver el libro',
      body: `Devolviste "${after.title}". ¿Cómo fue tu experiencia con ${ownerName}?`,
      data: {
        bookId: event.params.bookId,
        bookTitle: after.title,
        ownerId: after.ownerId,
        ownerName,
        ownerEmail,
      },
      type: 'devuelto_borrower',
    });
  } catch (err) {
    console.error('[onBookReturned] Error:', err);
  }
});

async function sendUserNotification({
  userId,
  title,
  body,
  data,
  type,
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  type: NotificationType;
}) {
  try {
    const notifRef = admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc();

    await notifRef.set({
      id: notifRef.id,
      type,
      title,
      body,
      data: data ?? {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      unread: true,
    });

    const snap = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('pushTokens')
      .get();

    const tokens = snap.docs.map((d) => d.get('token') as string).filter(Boolean);

    if (tokens.length === 0) {
      console.log(`[${type}] No tokens for user ${userId}`);
      return;
    }

    console.log(
      `[${type}] Sending to ${userId} tokens:`,
      tokens.map((t) => t.slice(-8)),
    );

    const messages = tokens.map((to) => ({ to, title, body, data: { type, ...data } }));
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.error(`[sendUserNotification] Error for user ${userId}:`, err);
  }
}

export const onRequestCancelled = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data() as any | undefined;
    const after = event.data?.after.data() as any | undefined;
    if (!before || !after) return;

    const isCancelledByBorrower =
      before.status === 'requested' &&
      after.status === 'available' &&
      !!before.borrowerId &&
      !after.borrowerId &&
      !!after.cancelledByBorrower;

    if (!isCancelledByBorrower) return;

    const ownerId = after.ownerId as string;
    const bookId = event.params.bookId as string;
    const borrowerId = before.borrowerId as string;

    const db = admin.firestore();
    const notifColl = db.collection('users').doc(ownerId).collection('notifications');

    let snap;
    try {
      snap = await notifColl
        .where('data.bookId', '==', bookId)
        .where('data.borrowerId', '==', borrowerId)
        .where('type', '==', 'solicitud')
        .where('unread', '==', true)
        .get();
    } catch (err: any) {
      console.warn('[onRequestCancelled] fallback query sin compuestos:', err?.message);
      snap = await notifColl.where('data.bookId', '==', bookId).get();
      snap = {
        docs: snap.docs.filter((d) => {
          const x = d.data() as any;
          return (
            x?.type === 'solicitud' && x?.unread === true && x?.data?.borrowerId === borrowerId
          );
        }),
      } as FirebaseFirestore.QuerySnapshot;
    }

    if (!snap || snap.docs.length === 0) {
      console.log('[onRequestCancelled] No unread solicitud notifications to close', {
        ownerId,
        bookId,
        borrowerId,
      });
      return;
    }

    const batch = db.batch();
    snap.docs.forEach((d) => {
      batch.update(d.ref, {
        unread: false,
        autoReadReason: 'cancelledByBorrower',
        autoReadAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    console.log(
      '[onRequestCancelled] Marked as read:',
      snap.docs.map((d) => d.id),
    );

    await db
      .doc(`books/${bookId}`)
      .update({ cancelledByBorrower: admin.firestore.FieldValue.delete() });
  } catch (err) {
    console.error('[onRequestCancelled] Error:', err);
  }
});

export const onUserLocationChanged = onDocumentWritten('users/{userId}', async (event) => {
  const before = event.data?.before.data() as any | undefined;
  const after = event.data?.after.data() as any | undefined;
  if (!after) return;

  const beforeLoc = before?.location;
  const afterLoc = after?.location;

  const changed =
    !beforeLoc ||
    beforeLoc.latitude !== afterLoc?.latitude ||
    beforeLoc.longitude !== afterLoc?.longitude ||
    beforeLoc.formattedAddress !== afterLoc?.formattedAddress;

  if (!changed || !afterLoc?.latitude || !afterLoc?.longitude) return;

  const userId = event.params.userId as string;
  const geohash = geohashForLocation([afterLoc.latitude, afterLoc.longitude]);

  const db = admin.firestore();
  const booksSnap = await db.collection('books').where('ownerId', '==', userId).get();

  const batch = db.batch();
  booksSnap.docs.forEach((d) => {
    batch.update(d.ref, {
      location: {
        latitude: afterLoc.latitude,
        longitude: afterLoc.longitude,
        formattedAddress: afterLoc.formattedAddress ?? null,
      },
      geohash,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
});

export const registerPushToken = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Auth requerido');

  const token: string = req.data?.token;
  const platform: string = req.data?.platform ?? 'unknown';
  if (!token) throw new HttpsError('invalid-argument', 'Falta token');

  const db = admin.firestore();
  const tokenId = token.replace(/[^A-Za-z0-9_-]/g, '_');
  const userRef = db.doc(`users/${uid}/pushTokens/${tokenId}`);

  try {
    const dupSnap = await db.collectionGroup('pushTokens').where('token', '==', token).get();
    const batch = db.batch();
    dupSnap.docs.forEach((d) => {
      const otherUid = d.ref.parent.parent?.id;
      if (otherUid && otherUid !== uid) batch.delete(d.ref);
    });
    batch.set(
      userRef,
      { token, platform, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    );
    await batch.commit();
    return { ok: true, deduped: true };
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('FAILED_PRECONDITION') || msg.toLowerCase().includes('index')) {
      await userRef.set(
        { token, platform, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true },
      );
      console.warn('[registerPushToken] Sin índice de collectionGroup; se registró sin dedupe.');
      return { ok: true, deduped: false };
    }
    console.error('[registerPushToken] error', err);
    throw new HttpsError('internal', err?.message ?? 'internal');
  }
});

export const unregisterPushToken = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Auth requerido');

  const token: string = req.data?.token;
  if (!token) throw new HttpsError('invalid-argument', 'Falta token');

  const db = admin.firestore();
  const tokenId = token.replace(/[^A-Za-z0-9_-]/g, '_');

  try {
    await db.runTransaction(async (tx) => {
      tx.delete(db.doc(`users/${uid}/pushTokens/${tokenId}`));
    });
    return { ok: true };
  } catch (err: any) {
    console.error('[unregisterPushToken] error', err);
    throw new HttpsError('internal', err?.message ?? 'internal');
  }
});
