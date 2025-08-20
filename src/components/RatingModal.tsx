import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Text, View, StyleSheet, Pressable, useColorScheme } from 'react-native';

import { Colors } from '@constants/Colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  userName: string;
};

export default function RatingModal({ visible, onClose, onRate, userName }: Props) {
  const [rating, setRating] = useState(0);

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

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
                <FontAwesome name={i <= rating ? 'star' : 'star-o'} size={32} color="#F5A623" />
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[styles.button, { backgroundColor: C.buttonSecondary }]}
            >
              <Text style={[styles.btnText, { color: C.buttonSecondaryText }]}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onRate(rating);
                onClose();
              }}
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
    width: 300,
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
