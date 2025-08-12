import { Slot, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirecciona basado en el estado del usuario
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        // Si está autenticado, carga las pantallas dentro de (tabs)
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="add-book"
            options={{ presentation: 'modal' }} // o quitar si no quieres modal
          />
        </>
      ) : (
        // Si NO está autenticado, carga las pantallas dentro de (auth)
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
          <AuthGate>
            <Slot />
          </AuthGate>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
