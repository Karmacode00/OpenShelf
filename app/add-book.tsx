import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@hooks/useThemeColor';

import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { getBookRepository } from '@/di/container';
import { addBookUseCase } from '@/domain/usecases/addBook';

export default function AddBookScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const addBook = addBookUseCase(getBookRepository());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bg = useThemeColor({}, 'background');
  const titleColor = useThemeColor({}, 'title');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const inputBg = useThemeColor({}, 'inputBg');
  const inputText = useThemeColor({}, 'inputText');
  const placeholder = useThemeColor({ light: '#5D7378', dark: '#88A7AC' }, 'icon');

  const s = getStyles({ bg, titleColor, text, border, inputBg, inputText });

  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu biblioteca para elegir la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !author.trim() || !imageUri) {
      Alert.alert('Faltan datos', 'Completa nombre, autor y agrega una foto.');
      return;
    }
    try {
      setIsSubmitting(true);
      await addBook({
        title: name.trim(),
        author: author.trim(),
        imageUri,
        ownerId: user?.uid!,
      });
      Alert.alert('Listo', 'Libro publicado con éxito.');
      router.replace('/(tabs)/home');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo publicar el libro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={s.container}>
        <Text style={s.title}>Agregar libro</Text>

        <Card>
          <Text style={s.label}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej. Atomic Habits"
            placeholderTextColor={placeholder}
            style={s.input}
          />

          <Text style={s.label}>Autor</Text>
          <TextInput
            value={author}
            onChangeText={setAuthor}
            placeholder="Ej. James Clear"
            placeholderTextColor={placeholder}
            style={s.input}
          />

          <Text style={s.label}>Foto del libro</Text>

          {imageUri ? (
            <View style={s.imageWrap}>
              <Image source={{ uri: imageUri }} style={s.image} />
            </View>
          ) : (
            <View style={[s.imageWrap, s.imagePlaceholder]}>
              <Text style={{ color: text, opacity: 0.6 }}>Sin imagen</Text>
            </View>
          )}

          <Button
            label={imageUri ? 'Cambiar foto' : 'Elegir foto'}
            variant="primary"
            onPress={pickImage}
            style={{ marginTop: 8 }}
            disabled={isSubmitting}
          />
        </Card>

        <View style={{ gap: 10 }}>
          <Button
            label="Publicar libro"
            variant="primary"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={() => router.back()}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (C: {
  bg: string;
  titleColor: string;
  text: string;
  border: string;
  inputBg: string;
  inputText: string;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
      padding: 20,
      gap: 16,
      justifyContent: 'space-between',
    },
    title: { fontSize: 24, fontWeight: '700', color: C.titleColor, textAlign: 'left' },
    label: { fontWeight: '700', marginBottom: 8, color: '#FFFFFF' },
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
    imageWrap: {
      height: 180,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: C.inputBg,
    },
    imagePlaceholder: { borderStyle: 'dashed' },
    image: { width: '100%', height: '100%' },
  });
