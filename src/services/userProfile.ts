import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/services/firebase';

type MinimalUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    formattedAddress?: string | null;
  } | null;
};

export async function upsertCurrentUserProfile(user: MinimalUser) {
  const { uid, displayName = null, email = null, photoURL = null } = user;

  const payload: any = {
    uid,
    displayName,
    email,
    photoURL,
    updatedAt: serverTimestamp(),
  };

  if (user.location !== null && user.location !== undefined) {
    payload.location = user.location;
  }

  await setDoc(doc(db, 'users', uid), payload, { merge: true });
}
