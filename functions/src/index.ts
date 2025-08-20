import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import fetch from 'node-fetch';

type NotificationType = 'solicitud' | 'aceptado' | 'rechazado' | 'devuelto';

admin.initializeApp();

export const onBookRequested = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    if (!(before.status === 'available' && after.status === 'requested')) return;

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

export const onBookReturned = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const isReturn =
      before.status === 'loaned' &&
      after.status === 'available' &&
      before.borrowerId &&
      !after.borrowerId;
    if (!isReturn) return;

    const borrowerSnap = await admin.firestore().doc(`users/${before.borrowerId}`).get();
    const borrowerName = borrowerSnap.get('displayName') || 'El usuario';

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
    const snap = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('pushTokens')
      .get();

    const tokens = snap.docs.map((d) => d.get('token') as string).filter(Boolean);

    if (!tokens.length) {
      console.log(`[${type}] No tokens for user ${userId}`);
      return;
    }

    const messages = tokens.map((to) => ({
      to,
      title,
      body,
      data: { type, ...data },
    }));

    const resp = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

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

    console.log(`[${type}] Notification sent to ${userId} (${resp.status})`);
  } catch (err) {
    console.error(`[sendUserNotification] Error for user ${userId}:`, err);
  }
}
