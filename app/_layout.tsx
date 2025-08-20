import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { FeedbackProvider } from '@/contexts/FeedbackContext';
import { registerForPushAsync } from '@/services/push';
import { upsertCurrentUserProfile } from '@/services/userProfile';

function AuthGate() {
  const { user, loading } = useAuth();

  useEffect(() => {
    (async () => {
      if (user?.uid) {
        await upsertCurrentUserProfile({
          uid: user.uid,
          displayName: user.displayName ?? null,
          email: user.email ?? null,
          photoURL: user.photoURL ?? null,
        });

        await registerForPushAsync(user.uid);
      }
    })().catch(console.warn);
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-book" options={{ presentation: 'modal' }} />
        </>
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AuthProvider>
          <FeedbackProvider>
            <AuthGate />
          </FeedbackProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
