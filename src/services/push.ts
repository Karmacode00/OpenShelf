import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Platform } from 'react-native';

function getProjectId() {
  // @ts-ignore
  return Constants?.easConfig?.projectId || Constants?.expoConfig?.extra?.eas?.projectId;
}

const FUNCTIONS_REGION = 'us-central1';

function getFns() {
  const fns = getFunctions(getApp(), FUNCTIONS_REGION);
  return fns;
}

export async function registerPushForCurrentUser() {
  const auth = getAuth();
  if (!auth.currentUser?.uid) {
    throw new Error('No hay usuario autenticado para registrar push.');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  const { data: expoToken } = await Notifications.getExpoPushTokenAsync({
    projectId: getProjectId(),
  });

  try {
    const fn = httpsCallable(getFns(), 'registerPushToken');
    await fn({ token: expoToken, platform: Platform.OS });
  } catch (e: any) {
    console.error('registerPushToken failed', {
      code: e?.code,
      message: e?.message,
      details: e?.details,
    });
    throw e;
  }
}

export async function unregisterPushForCurrentUser() {
  const auth = getAuth();
  if (!auth.currentUser?.uid) return;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId: getProjectId() })).data;
  try {
    const fn = httpsCallable(getFns(), 'unregisterPushToken');
    await fn({ token });
  } catch (e: any) {
    console.error('unregisterPushToken failed', {
      code: e?.code,
      message: e?.message,
      details: e?.details,
    });
    throw e;
  }
}
