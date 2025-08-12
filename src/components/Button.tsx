import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

type Variant = 'primary' | 'secondary';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  style?: PressableProps['style'];
}

export default function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const s = getStyles(C);

  const base = variant === 'primary' ? s.primaryBtn : s.secondaryBtn;
  const textStyle = variant === 'primary' ? s.primaryBtnText : s.secondaryBtnText;

  const composedStyle: PressableProps['style'] =
    typeof style === 'function' ? (state) => [base, style(state)] : [base, style];

  return (
    <Pressable style={composedStyle} {...rest}>
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const getStyles = (C: typeof Colors.light) =>
  StyleSheet.create({
    primaryBtn: {
      backgroundColor: C.buttonPrimary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: C.buttonPrimaryText,
      fontWeight: '700',
      fontSize: 20,
    },
    secondaryBtn: {
      backgroundColor: C.buttonSecondary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: C.buttonSecondaryText,
      fontWeight: '700',
      fontSize: 20,
    },
  });
