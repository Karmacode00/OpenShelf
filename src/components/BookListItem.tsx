import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { Colors } from '@constants/Colors';

type ActionStatus = 'Solicitar' | 'Pendiente' | 'Devolver' | 'Loading';

type Props = {
  title: string;
  imageUrl: string;
  author?: string;
  showActionButton?: boolean;
  actionStatus?: ActionStatus;
  actionLabel?: string;
  onActionPress?: () => void;
  distanceKm?: number;
  ownerRating?: number;
  ownerName?: string;
  showDeleteButton?: boolean;
  canDelete?: boolean;
  onDeletePress?: () => void;
};

const BookListItem = ({
  title,
  imageUrl,
  author,
  showActionButton = false,
  actionStatus = 'Solicitar',
  actionLabel,
  onActionPress,
  distanceKm,
  ownerRating,
  ownerName,
  showDeleteButton = false,
  canDelete = false,
  onDeletePress,
}: Props) => {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const hasCustomLabel = !!actionLabel;

  const isDisabled =
    actionStatus === 'Loading' || (actionStatus === 'Pendiente' && !hasCustomLabel);

  const getButtonStyles = () => {
    if (hasCustomLabel) {
      return { backgroundColor: C.buttonPrimary, color: C.buttonPrimaryText };
    }
    switch (actionStatus) {
      case 'Solicitar':
      case 'Devolver':
        return { backgroundColor: C.buttonPrimary, color: C.buttonPrimaryText };
      case 'Loading':
      case 'Pendiente':
        return {
          backgroundColor: C.surface,
          color: C.icon,
          borderColor: C.border,
          borderWidth: 1,
        };
      default:
        return {};
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <View style={[styles.card, { backgroundColor: C.card }]} testID="book-list-item">
      {showDeleteButton && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={canDelete ? 'Eliminar libro' : 'Eliminar deshabilitado'}
          disabled={!canDelete}
          onPress={onDeletePress}
          hitSlop={8}
          style={[styles.trashBtn, !canDelete && { opacity: 0.45 }]}
        >
          <Ionicons name="trash" size={18} color={canDelete ? '#ef4444' : C.icon} />
        </Pressable>
      )}

      <Image source={{ uri: imageUrl }} style={styles.cover} />

      <View style={styles.rightBlock}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: C.textContrast }]} numberOfLines={2}>
            {title}
          </Text>
          {author && (
            <Text
              style={[styles.author, { color: C.textContrast, opacity: 0.85 }]}
              numberOfLines={1}
            >
              {author}
            </Text>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View style={{ flexDirection: 'column', gap: 2 }}>
            {ownerName !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person" size={14} color="#FFFF" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 13, color: C.textContrast, opacity: 0.8 }}>
                  {ownerName}
                </Text>
              </View>
            )}
            {ownerRating !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={14} color="#F5A623" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 13, color: C.textContrast, opacity: 0.8 }}>
                  {ownerRating.toFixed(1)}
                </Text>
              </View>
            )}
            {distanceKm !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="location"
                  size={14}
                  color="#ec574aff"
                  style={{ marginRight: 4, opacity: 0.7 }}
                />
                <Text
                  style={[styles.meta, { color: C.textContrast, opacity: 0.7 }]}
                  numberOfLines={1}
                >
                  {distanceKm.toFixed(2)} km
                </Text>
              </View>
            )}
          </View>

          <View>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'relative',
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
  textBlock: { flexShrink: 0, gap: 2, alignItems: 'flex-start' },
  title: { fontWeight: '700', fontSize: 18 },
  author: { fontSize: 14 },
  meta: { fontSize: 13 },
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
  trashBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BookListItem;
