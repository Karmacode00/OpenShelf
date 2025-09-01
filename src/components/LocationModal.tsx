import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Region } from 'react-native-maps';

import MapPicker from './MapPicker';
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

  const [permDenied, setPermDenied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const userRepo = useMemo(() => getUserRepository(), []);
  const saveLocation = useMemo(() => saveUserLocationUseCase(userRepo), [userRepo]);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      setMapReady(false);
      setPermDenied(false);
      setErrorMsg(null);
      setRegion(null);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermDenied(true);
          return;
        }

        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = pos.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        } catch (err) {
          console.warn('[Location] getCurrentPositionAsync falló, probando lastKnown:', err);
          const last = await Location.getLastKnownPositionAsync();
          if (last?.coords) {
            const { latitude, longitude } = last.coords;
            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            });
          } else {
            setErrorMsg('No pudimos obtener tu ubicación. Verifica el GPS e inténtalo de nuevo.');
          }
        }
      } catch (err) {
        console.error('[Location] Error solicitando permisos/ubicación:', err);
        setErrorMsg('Ocurrió un problema con la ubicación. Revisa los permisos de la app.');
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
      } catch (err) {
        console.warn(
          '[Location] reverseGeocodeAsync falló, se guardará sin formattedAddress:',
          err,
        );
      }

      await saveLocation(userId, {
        latitude: region.latitude,
        longitude: region.longitude,
        formattedAddress: formatted,
      });

      onSaved?.();
      onClose();
    } catch (err) {
      console.error('[Location] Error guardando ubicación:', err);
      Alert.alert('Error', 'No se pudo guardar tu ubicación. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible animationType="slide" transparent statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <Text style={s.title}>Establecer ubicación principal</Text>
          <Text style={s.sub}>
            Usaremos tu ubicación para mostrarte libros cercanos. Puedes ajustar el pin antes de
            guardar.
          </Text>

          <View style={s.mapWrap}>
            {!region && (
              <View style={s.mapPlaceholder}>
                <ActivityIndicator size="large" color={C.tint} />
                <Text style={{ color: C.textContrast, opacity: 0.8, marginTop: 8 }}>
                  {permDenied
                    ? 'Permiso de ubicación denegado. Habilítalo en Ajustes para continuar.'
                    : (errorMsg ?? 'Obteniendo tu ubicación...')}
                </Text>
              </View>
            )}

            {region && (
              <View style={{ flex: 1 }}>
                <View
                  style={{ flex: 1, opacity: mapReady ? 1 : 0.01 }}
                  pointerEvents={mapReady ? 'auto' : 'none'}
                >
                  <MapPicker
                    region={region}
                    draggable
                    onRegionChange={(r) => setRegion(r)}
                    onReady={() => setMapReady(true)}
                  />
                </View>

                {!mapReady && (
                  <View style={s.mapLoadingOverlay}>
                    <ActivityIndicator size="large" color={C.tint} />
                    <Text style={{ color: C.textContrast, opacity: 0.8, marginTop: 8 }}>
                      Cargando mapa...
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={s.actions}>
            <Pressable onPress={onClose} style={[s.btn, { backgroundColor: C.buttonSecondary }]}>
              <Text style={[s.btnText, { color: C.buttonSecondaryText }]}>Más tarde</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving || !region}
              accessibilityRole="button"
              accessibilityLabel="Guardar"
              testID="save-button"
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
    mapPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0002',
    },
    mapLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0003',
    },
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
