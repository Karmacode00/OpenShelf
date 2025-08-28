import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { Colors } from '@constants/Colors';

import LocationModal from '@/components/LocationModal';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRepository } from '@/di/container';
import { UserLocation } from '@/domain/repositories/UserRepository';
import { getUserLocationUseCase } from '@/domain/usecases/getUserLocation';
import { sendPasswordResetUseCase } from '@/domain/usecases/sendPasswordReset';

export default function ProfileSettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const { user } = useAuth();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const repo = useMemo(() => getUserRepository(), []);
  const sendPasswordReset = useMemo(() => sendPasswordResetUseCase(repo), [repo]);
  const getLocation = useMemo(() => getUserLocationUseCase(repo), [repo]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!user?.uid) return;
      const loc = await getLocation(user.uid);
      setLocation(loc);
      setLoading(false);
    };
    fetchLocation();
  }, [modalVisible, user?.uid]);

  const handlePasswordReset = async () => {
    try {
      if (!user?.email) return;
      await sendPasswordReset(user.email);
      alert('Te hemos enviado un correo para cambiar tu contraseña.');
    } catch (err) {
      console.error('Error al enviar correo de cambio de contraseña:', err);
      alert('Ocurrió un error al enviar el correo.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: C.buttonSecondary,
            overflow: 'hidden',
          }}
        >
          <Ionicons name="chevron-back" size={22} color={C.buttonSecondaryText} />
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: C.title }}>Administrar perfil</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: C.text }]}>Ubicación actual:</Text>
        {loading ? (
          <ActivityIndicator />
        ) : location ? (
          <Text style={[styles.value, { color: C.text }]}>📍 {location.formattedAddress}</Text>
        ) : (
          <Text style={{ color: C.text, opacity: 0.7 }}>No se ha establecido una ubicación</Text>
        )}
        <Pressable
          style={[styles.button, { backgroundColor: C.buttonPrimary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: C.buttonPrimaryText }}>Cambiar ubicación</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: C.text }]}>Contraseña:</Text>
        <Text style={[styles.value, { color: C.text }]}>••••••••</Text>
        <Pressable
          style={[styles.button, { backgroundColor: '#5D7378' }]}
          onPress={handlePasswordReset}
        >
          <Text style={{ color: '#fff' }}>Cambiar contraseña</Text>
        </Pressable>
      </View>

      <LocationModal
        visible={modalVisible}
        userId={user?.uid ?? ''}
        onClose={() => setModalVisible(false)}
        onSaved={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 20 },
  section: { gap: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  value: { fontSize: 14, opacity: 0.85 },
  button: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
