import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/services/firebase';

type MinimalUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
};

export async function upsertCurrentUserProfile(user: MinimalUser) {
  const { uid, displayName = null, email = null, photoURL = null } = user;
  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      displayName,
      email,
      photoURL,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}
