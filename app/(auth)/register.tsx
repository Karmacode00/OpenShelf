import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      await register(email, password, name);
      router.replace('/home');
    } catch (e) {
      Alert.alert('Error', error || 'Error al registrarse');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

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

      <Button title="Registrarme" onPress={handleRegister} />

      <TouchableOpacity onPress={() => router.push('/login')} style={styles.link}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

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
