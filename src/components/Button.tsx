import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

type Variant = 'primary' | 'secondary';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const s = getStyles(C);

  const btnStyle = variant === 'primary' ? s.primaryBtn : s.secondaryBtn;
  const textStyle = variant === 'primary' ? s.primaryBtnText : s.secondaryBtnText;
  const spinnerColor = variant === 'primary' ? C.buttonPrimaryText : C.buttonSecondaryText;

  const composedStyle: PressableProps['style'] =
    typeof style === 'function' ? (state) => [btnStyle, style(state)] : [btnStyle, style];

  return (
    <Pressable style={composedStyle} disabled={disabled || loading} {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
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
