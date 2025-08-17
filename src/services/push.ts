import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { doc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import { db } from '@/services/firebase';

export async function registerForPushAsync(userId: string) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log('Expo token:', token);

  await setDoc(
    doc(db, 'users', userId, 'pushTokens', token),
    {
      token,
      updatedAt: Date.now(),
      platform: Platform.OS,
    },
    { merge: true },
  );
}
