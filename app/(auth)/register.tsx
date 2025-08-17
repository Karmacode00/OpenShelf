import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const s = getStyles(C);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Error', 'Por favor completa todos los campos');
    }
    try {
      await register(email, password, name);
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Error', error || 'Error al registrarse');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <View style={s.container}>
        <View>
          <Text style={s.title}>Crear cuenta</Text>
          <Text style={s.description}>
            Ingresa tu nombre, correo y una contraseña para registrarte
          </Text>
        </View>

        <Card>
          <Text style={s.label}>Nombre</Text>
          <TextInput
            placeholder="Nombre completo"
            placeholderTextColor={scheme === 'light' ? '#024059' : '#7AA5AB'}
            value={name}
            onChangeText={setName}
            style={s.input}
          />

          <Text style={s.label}>Email</Text>
          <TextInput
            placeholder="usuario@email.cl"
            placeholderTextColor={scheme === 'light' ? '#024059' : '#7AA5AB'}
            value={email}
            onChangeText={setEmail}
            style={s.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={s.label}>Contraseña</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={scheme === 'light' ? '#024059' : '#7AA5AB'}
            value={password}
            onChangeText={setPassword}
            style={s.input}
            secureTextEntry
          />
        </Card>

        <View style={s.buttonGroup}>
          <Button label="Registrarme" variant="primary" onPress={handleRegister} />
          <Button
            label="Iniciar sesión"
            variant="secondary"
            onPress={() => router.push('/login')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// 🔹 Estilos alineados con la pantalla de Login
const getStyles = (C: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.background,
      padding: 20,
      justifyContent: 'space-evenly',
    },
    title: {
      fontSize: 32,
      marginBottom: 16,
      fontWeight: 'bold',
      color: C.title,
    },
    description: {
      color: C.text,
      fontSize: 16,
    },
    label: {
      fontWeight: '700',
      marginBottom: 8,
      color: C.textContrast,
    },
    input: {
      backgroundColor: C.inputBg,
      color: C.inputText,
      borderColor: C.border,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    buttonGroup: {
      flexDirection: 'column',
      gap: 10,
    },
    primaryBtn: {
      backgroundColor: C.buttonPrimary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryBtnText: { color: C.buttonPrimaryText, fontWeight: '700', fontSize: 20 },
    secondaryBtn: {
      backgroundColor: C.buttonSecondary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    secondaryBtnText: { color: C.buttonSecondaryText, fontWeight: '700', fontSize: 20 },
  });
