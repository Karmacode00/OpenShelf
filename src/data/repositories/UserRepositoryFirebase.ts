import { sendPasswordResetEmail } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import type { UserLocation, UserRepository } from '@/domain/repositories/UserRepository';
import { auth, db } from '@/services/firebase';

export class UserRepositoryFirebase implements UserRepository {
  async getUserLocation(userId: string): Promise<UserLocation | null> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const loc = data.location;

    if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
      return null;
    }

    return {
      latitude: loc.latitude,
      longitude: loc.longitude,
      formattedAddress: loc.formattedAddress ?? null,
    };
  }

  async saveUserLocation(userId: string, location: UserLocation): Promise<void> {
    await setDoc(
      doc(db, 'users', userId),
      {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          formattedAddress: location.formattedAddress ?? null,
          updatedAt: serverTimestamp(),
        },
      },
      { merge: true },
    );
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  async rateUser(
    raterId: string,
    ratedId: string,
    rating: number,
    comment?: string,
  ): Promise<void> {
    const ratingRef = collection(db, 'users', ratedId, 'ratings');
    const userRef = doc(db, 'users', ratedId);

    try {
      await addDoc(ratingRef, {
        raterId,
        rating,
        comment: comment ?? null,
        createdAt: serverTimestamp(),
      });

      const snap = await getDocs(ratingRef);
      const ratings = snap.docs.map((doc) => doc.data().rating as number);
      const total = ratings.reduce((sum, r) => sum + r, 0);
      const count = ratings.length;

      await setDoc(
        userRef,
        {
          rating: { total, count },
        },
        { merge: true },
      );
    } catch (error) {
      console.error('Error rating user:', error);
      throw error;
    }
  }

  async getUserRatingScore(userId: string): Promise<number | null> {
    try {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);

      if (!snap.exists()) return 0;

      const data = snap.data() as any;
      const total = data.rating?.total ?? 0;
      const count = data.rating?.count ?? 0;

      if (count === 0) return null;

      return total / count;
    } catch (err) {
      console.error('Error obteniendo rating del usuario:', err);
      throw err;
    }
  }
}
