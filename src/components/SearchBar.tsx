import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { useThemeColor } from '@hooks/useThemeColor';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar libro',
  onSubmit,
}: Props) {
  const bg = useThemeColor({}, 'inputBg');
  const text = useThemeColor({}, 'inputText');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({ light: '#5D7378', dark: '#88A7AC' }, 'icon');

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name="search" size={22} color={tint} style={{ marginLeft: 10, marginRight: 8 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        onSubmitEditing={onSubmit}
        style={[styles.input, { color: text }]}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    fontSize: 16,
  },
});
