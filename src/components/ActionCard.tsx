import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColor } from '@hooks/useThemeColor';

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function ActionCard({ title, subtitle, icon = 'add-circle', onPress }: Props) {
  const card = useThemeColor({}, 'card'); // bloque oscuro
  const accent = useThemeColor({}, 'accent'); // círculo celeste
  const textContrast = useThemeColor({}, 'textContrast');

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: card }]}>
      <View style={styles.left}>
        <Ionicons name={icon} size={24} color={textContrast} style={{ marginRight: 12 }} />
        <View>
          <Text style={[styles.title, { color: textContrast }]}>{title}</Text>
          {!!subtitle && (
            <Text style={[styles.sub, { color: textContrast, opacity: 0.85 }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={[styles.chevron, { backgroundColor: accent }]}>
        <Ionicons name="chevron-forward" size={20} color={textContrast} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  sub: { fontSize: 12, flexShrink: 1 },
  chevron: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
