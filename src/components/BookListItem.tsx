import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColor } from '@hooks/useThemeColor';

type ActionStatus = 'Solicitar' | 'Solicitado' | 'Devolver' | 'Loading';

type Props = {
  title: string;
  imageUrl: string;
  author?: string;
  showActionButton?: boolean;
  actionStatus?: ActionStatus;
  actionLabel?: string;
  onActionPress?: () => void;
};

const BookListItem = ({
  title,
  imageUrl,
  author,
  showActionButton = false,
  actionStatus = 'Solicitar',
  actionLabel,
  onActionPress,
}: Props) => {
  const theme = {
    card: useThemeColor({}, 'card'),
    textContrast: useThemeColor({}, 'textContrast'),
    buttonPrimary: useThemeColor({}, 'buttonPrimary'),
    buttonPrimaryText: useThemeColor({}, 'buttonPrimaryText'),
    surface: useThemeColor({}, 'surface'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'border'),
  };

  const hasCustomLabel = !!actionLabel;

  const isDisabled =
    actionStatus === 'Loading' || (actionStatus === 'Solicitado' && !hasCustomLabel);

  const getButtonStyles = () => {
    if (hasCustomLabel) {
      return { backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText };
    }
    switch (actionStatus) {
      case 'Solicitar':
      case 'Devolver':
        return { backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText };
      case 'Loading':
      case 'Solicitado':
        return {
          backgroundColor: theme.surface,
          color: theme.icon,
          borderColor: theme.border,
          borderWidth: 1,
        };
      default:
        return {};
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]} testID="book-list-item">
      <Image source={{ uri: imageUrl }} style={styles.cover} />

      <View style={styles.rightBlock}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: theme.textContrast }]} numberOfLines={2}>
            {title}
          </Text>
          {author && (
            <Text
              style={[styles.author, { color: theme.textContrast, opacity: 0.85 }]}
              numberOfLines={1}
            >
              {author}
            </Text>
          )}
        </View>

        {showActionButton && (
          <Pressable
            disabled={isDisabled}
            onPress={onActionPress}
            style={[
              styles.actionBtn,
              {
                backgroundColor: buttonStyles.backgroundColor,
                borderColor: buttonStyles.borderColor,
                borderWidth: buttonStyles.borderWidth,
              },
              isDisabled && { opacity: 0.7 },
            ]}
            hitSlop={6}
          >
            {actionStatus === 'Loading' ? (
              <ActivityIndicator size="small" color={buttonStyles.color} />
            ) : (
              <Text style={{ color: buttonStyles.color }}>{actionLabel ?? actionStatus}</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    alignItems: 'stretch',
    minHeight: 118,
  },
  cover: {
    width: 82,
    height: 118,
    borderRadius: 8,
    backgroundColor: '#E6EEF0',
    flexShrink: 0,
  },
  rightBlock: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  textBlock: { flexShrink: 1, gap: 4 },
  title: { fontWeight: '700', fontSize: 18 },
  author: { fontSize: 14 },
  actionBtn: {
    minWidth: 100,
    height: 34,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

export default BookListItem;
