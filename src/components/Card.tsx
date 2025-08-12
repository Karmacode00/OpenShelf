import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { useThemeColor } from '@hooks/useThemeColor';

type CardProps = ViewProps & {
  children: React.ReactNode;
};

export default function Card({ children, style, ...rest }: CardProps) {
  const bg = useThemeColor({ light: '#024059', dark: '#1E1E1E' }, 'card');

  return (
    <View style={[styles.card, { backgroundColor: bg }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
});
