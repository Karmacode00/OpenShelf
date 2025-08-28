import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Text, View, StyleSheet, Pressable, TextInput, useColorScheme } from 'react-native';

import { Colors } from '@constants/Colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: number, comment?: string) => void;
  userName: string;
};

export default function RatingModal({ visible, onClose, onRate, userName }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const handleSubmit = () => {
    onRate(rating, comment.trim() || undefined);
    onClose();
    setRating(0);
    setComment('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: C.background }]}>
          <Text style={[styles.title, { color: C.text }]}>
            Califica tu experiencia con {userName}
          </Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => setRating(i)}>
                <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={32} color="#F5A623" />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={[
              styles.input,
              {
                borderColor: C.border,
                color: C.text,
              },
            ]}
            placeholder="Deja un comentario (opcional)"
            placeholderTextColor={C.icon}
            value={comment}
            onChangeText={setComment}
            multiline
          />

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[styles.button, { backgroundColor: C.buttonSecondary }]}
            >
              <Text style={[styles.btnText, { color: C.buttonSecondaryText }]}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={rating === 0}
              style={[
                styles.button,
                {
                  backgroundColor: C.buttonPrimary,
                  opacity: rating === 0 ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.btnText, { color: C.buttonPrimaryText }]}>Enviar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 320,
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '700',
  },
});
