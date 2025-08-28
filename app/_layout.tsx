import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { FeedbackProvider } from '@/contexts/FeedbackContext';
import { registerPushForCurrentUser } from '@/services/push';

function AuthGate() {
  const { user, loading } = useAuth();

  useEffect(() => {
    (async () => {
      if (user?.uid)
        registerPushForCurrentUser().catch((e) => console.error('Push registration failed:', e));
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync(Ionicons.font);
      setReady(true);
    }
    loadFonts();
  }, []);

  if (!ready) return null;

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
