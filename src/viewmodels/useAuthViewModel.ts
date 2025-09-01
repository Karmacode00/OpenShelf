// src/viewmodels/useAuthViewModel.ts
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '../services/firebase';

import { getUserRepository } from '@/di/container';
import { upsertCurrentUserProfileUseCase } from '@/domain/usecases/upsertCurrentUser';
import type { UserProfile } from '@/domain/entities/UserProfile';

export const useAuthViewModel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: name });

        const repo = getUserRepository();
        const upsert = upsertCurrentUserProfileUseCase(repo);

        const profile: UserProfile = {
          uid: currentUser.uid,
          displayName: name,
          email: currentUser.email ?? null,
          photoURL: currentUser.photoURL ?? null,
          location: null,
        };

        await upsert(profile);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
};
