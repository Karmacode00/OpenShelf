import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      await login(email, password);
      router.replace('/home');
    } catch (e) {
      Alert.alert('Error', error || 'Hubo un error al iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button title="Ingresar" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push('/register')} style={styles.link}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
  },
});
