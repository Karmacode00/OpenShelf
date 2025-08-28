import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import bookPin from '@assets/images/book.png';

type Props = {
  region: Region;
  markers?: {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    onPress?: () => void;
  }[];
  onRegionChange?: (region: Region) => void;
  draggable?: boolean;
  onReady?: () => void;
  autoFit?: boolean;
  hasList?: boolean;
};

export default function MapPicker({
  region,
  markers = [],
  onRegionChange,
  draggable = false,
  onReady,
  autoFit = true,
  hasList = false,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !autoFit || !mapRef.current) return;

    if (markers.length > 1) {
      mapRef.current.fitToCoordinates(
        markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })),
        { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true },
      );
    } else {
      mapRef.current.animateToRegion(
        {
          latitude: markers[0]?.latitude ?? region.latitude,
          longitude: markers[0]?.longitude ?? region.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        350,
      );
    }
  }, [ready, autoFit, markers, region]);

  return (
    <View style={styles.mapWrap}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        onMapReady={() => {
          setReady(true);
          onReady?.();
        }}
        onRegionChangeComplete={onRegionChange}
      >
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          draggable={draggable}
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            onRegionChange?.({ ...region, latitude, longitude });
          }}
        />
        {hasList &&
          markers.map((m) => (
            <Marker
              key={m.id}
              identifier={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              title={m.title}
              description={m.description}
              anchor={{ x: 0.5, y: 1 }}
              image={bookPin}
              onPress={m.onPress}
            />
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
