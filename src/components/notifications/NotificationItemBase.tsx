import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useThemeColor } from '@hooks/useThemeColor';

interface Props {
  children: React.ReactNode;
  unread?: boolean;
}

export default function NotificationItemBase({ children, unread }: Props) {
  const bg = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'tint');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg },
        unread && { borderWidth: 1.5, borderColor: border },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
});
