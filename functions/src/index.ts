import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import fetch from 'node-fetch';

admin.initializeApp();

export const onBookRequested = onDocumentUpdated('books/{bookId}', async (event) => {
  const before = event.data?.before.data() as any;
  const after = event.data?.after.data() as any;
  if (!before || !after) return;

  if (!(before.status === 'available' && after.status === 'requested')) return;

  const ownerId = after.ownerId as string;
  const title = after.title as string;

  const snap = await admin
    .firestore()
    .collection('users')
    .doc(ownerId)
    .collection('pushTokens')
    .get();
  const tokens = snap.docs.map((d) => d.get('token') as string).filter(Boolean);

  if (!tokens.length) {
    console.log('No tokens for owner', ownerId);
    return;
  }

  const messages = tokens.map((to) => ({
    to,
    title: 'Tu libro fue solicitado',
    body: `"${title}" tiene una nueva solicitud`,
    data: { type: 'BOOK_REQUESTED', bookId: event.params.bookId },
  }));

  const resp = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  const notifRef = admin
    .firestore()
    .collection('users')
    .doc(ownerId)
    .collection('notifications')
    .doc(); // id auto

  await notifRef.set({
    id: notifRef.id,
    type: 'BOOK_REQUESTED',
    bookId: event.params.bookId,
    title: 'Tu libro fue solicitado',
    body: `"${title}" tiene una nueva solicitud`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    unread: true,
  });

  console.log('Expo push response status:', resp.status);
  try {
    console.log('Expo push response body:', await resp.text());
  } catch {}
});
