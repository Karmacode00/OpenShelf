import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, ViewProps } from 'react-native';

import { useThemeColor } from '@hooks/useThemeColor';

type Props = ViewProps & {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'danger' | 'info' | 'neutral';
};

export default function InlineButton({
  label,
  onPress,
  disabled,
  style,
  textStyle,
  variant = 'primary',
  ...rest
}: Props) {
  const primary = useThemeColor({}, 'buttonPrimary');
  const primaryText = useThemeColor({}, 'buttonPrimaryText');
  const secondary = useThemeColor({}, 'buttonSecondary');
  const secondaryText = useThemeColor({}, 'buttonSecondaryText');
  const accent = useThemeColor({}, 'tint');

  const palette =
    variant === 'danger'
      ? { bg: '#C62828', fg: '#fff' }
      : variant === 'info'
        ? { bg: accent, fg: '#fff' }
        : variant === 'neutral'
          ? { bg: secondary, fg: secondaryText }
          : { bg: primary, fg: primaryText };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: palette.bg, opacity: disabled ? 0.7 : 1 }, style]}
      hitSlop={6}
      {...rest}
    >
      <Text style={[styles.txt, { color: palette.fg }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: { fontWeight: '700' },
});
