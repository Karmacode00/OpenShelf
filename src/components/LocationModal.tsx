import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { Colors } from '@constants/Colors';

import { getUserRepository } from '@/di/container';
import { saveUserLocationUseCase } from '@/domain/usecases/saveUserLocation';

type Props = {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onSaved?: () => void;
};

export default function LocationModal({ visible, userId, onClose, onSaved }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const s = getStyles(C);

  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [saving, setSaving] = useState(false);

  const userRepo = useMemo(() => getUserRepository(), []);
  const saveLocation = useMemo(() => saveUserLocationUseCase(userRepo), [userRepo]);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = pos.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  const handleSave = async () => {
    if (!region) return;
    setSaving(true);
    try {
      let formatted: string | null = null;
      try {
        const res = await Location.reverseGeocodeAsync({
          latitude: region.latitude,
          longitude: region.longitude,
        });
        if (res?.[0]) {
          const r = res[0];
          formatted = [r.street, r.name, r.city, r.region, r.postalCode, r.country]
            .filter(Boolean)
            .join(', ');
        }
      } catch {}

      await saveLocation(userId, {
        latitude: region.latitude,
        longitude: region.longitude,
        formattedAddress: formatted,
      });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <Text style={s.title}>Establecer ubicación principal</Text>
          <Text style={s.sub}>
            Usaremos tu ubicación para mostrarte libros cercanos. Puedes ajustar el pin antes de
            guardar.
          </Text>

          <View style={s.mapWrap}>
            {loading || !region ? (
              <View style={s.loader}>
                <ActivityIndicator size="large" color={C.buttonPrimary} />
                <Text style={[s.sub, { marginTop: 8 }]}>Obteniendo ubicación…</Text>
              </View>
            ) : (
              <MapView
                style={{ flex: 1 }}
                initialRegion={region}
                onRegionChangeComplete={(r) => setRegion(r)}
              >
                <Marker
                  coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                  draggable
                  onDragEnd={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setRegion({ ...region, latitude, longitude });
                  }}
                />
              </MapView>
            )}
          </View>

          <View style={s.actions}>
            <Pressable onPress={onClose} style={[s.btn, { backgroundColor: C.buttonSecondary }]}>
              <Text style={[s.btnText, { color: C.buttonSecondaryText }]}>Más tarde</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving || !region}
              style={[s.btn, { backgroundColor: C.buttonPrimary, opacity: saving ? 0.7 : 1 }]}
            >
              {saving ? (
                <ActivityIndicator color={C.buttonPrimaryText} />
              ) : (
                <Text style={[s.btnText, { color: C.buttonPrimaryText }]}>Guardar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(C: (typeof Colors)['light']) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      gap: 12,
      backgroundColor: C.card,
    },
    title: { fontSize: 18, fontWeight: '700', color: C.textContrast },
    sub: { fontSize: 13, color: C.textContrast, opacity: 0.85 },
    mapWrap: {
      height: 280,
      borderRadius: 12,
      overflow: 'hidden',
    },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    btn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnText: { fontWeight: '700' },
  });
}
