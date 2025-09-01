import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

jest.mock('@assets/images/book.png', () => 'book-pin.png');

let mockMapRef: { fitToCoordinates: jest.Mock; animateToRegion: jest.Mock } | null = null;

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMap = React.forwardRef((props: any, ref: any) => {
    const fitToCoordinates = jest.fn();
    const animateToRegion = jest.fn();
    React.useImperativeHandle(ref, () => ({
      fitToCoordinates,
      animateToRegion,
    }));
    mockMapRef = { fitToCoordinates, animateToRegion };
    return React.createElement(View, { testID: 'mock-map', ...props });
  });

  const Marker = (p: any) => React.createElement(View, { testID: 'mock-marker', ...p });

  return { __esModule: true, default: MockMap, Marker };
});

import MapPicker from '@/components/MapPicker';
import type { Region } from 'react-native-maps';

const baseRegion: Region = {
  latitude: -33.45,
  longitude: -70.67,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

describe('MapPicker', () => {
  beforeEach(() => {
    mockMapRef = null;
    jest.clearAllMocks();
  });

  it('con >1 markers y autoFit=true llama fitToCoordinates al estar listo el mapa', async () => {
    const onReady = jest.fn();

    render(
      <MapPicker
        region={baseRegion}
        markers={[
          { id: 'm1', latitude: -33.45, longitude: -70.67 },
          { id: 'm2', latitude: -33.46, longitude: -70.68 },
        ]}
        onReady={onReady}
        autoFit
        hasList
      />,
    );

    const map = screen.getByTestId('mock-map');
    map.props.onMapReady?.();

    await waitFor(() => expect(onReady).toHaveBeenCalled());

    await waitFor(() => {
      expect(mockMapRef).toBeTruthy();
      expect(mockMapRef!.fitToCoordinates).toHaveBeenCalledTimes(1);
      const [coords, opts] = mockMapRef!.fitToCoordinates.mock.calls[0];

      expect(coords).toEqual([
        { latitude: -33.45, longitude: -70.67 },
        { latitude: -33.46, longitude: -70.68 },
      ]);
      expect(opts).toEqual(
        expect.objectContaining({
          edgePadding: expect.objectContaining({ top: 60, right: 60, bottom: 60, left: 60 }),
          animated: true,
        }),
      );
    });
  });

  it('con 1 marker llama animateToRegion con coords del marker y deltas 0.005', async () => {
    render(
      <MapPicker
        region={baseRegion}
        markers={[{ id: 'm1', latitude: -33.461, longitude: -70.681 }]}
        autoFit
        hasList
      />,
    );

    const map = screen.getByTestId('mock-map');
    map.props.onMapReady?.();

    await waitFor(() => {
      expect(mockMapRef).toBeTruthy();
      expect(mockMapRef!.animateToRegion).toHaveBeenCalledTimes(1);
      const [regionArg, durationArg] = mockMapRef!.animateToRegion.mock.calls[0];

      expect(regionArg).toEqual(
        expect.objectContaining({
          latitude: -33.461,
          longitude: -70.681,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }),
      );
      expect(durationArg).toBe(350);
    });
  });

  it('sin markers llama animateToRegion usando el region prop', async () => {
    render(<MapPicker region={baseRegion} autoFit />);

    const map = screen.getByTestId('mock-map');
    map.props.onMapReady?.();

    await waitFor(() => {
      expect(mockMapRef).toBeTruthy();
      expect(mockMapRef!.animateToRegion).toHaveBeenCalledTimes(1);
      const [regionArg, durationArg] = mockMapRef!.animateToRegion.mock.calls[0];

      expect(regionArg).toEqual(
        expect.objectContaining({
          latitude: baseRegion.latitude,
          longitude: baseRegion.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }),
      );
      expect(durationArg).toBe(350);
    });
  });

  it('propaga onRegionChange mediante onRegionChangeComplete de MapView', () => {
    const onRegionChange = jest.fn();

    render(<MapPicker region={baseRegion} onRegionChange={onRegionChange} />);

    const map = screen.getByTestId('mock-map');
    const newRegion: Region = {
      latitude: -33.5,
      longitude: -70.7,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    map.props.onRegionChangeComplete?.(newRegion);

    expect(onRegionChange).toHaveBeenCalledWith(newRegion);
  });

  it('al arrastrar el Marker central llama onRegionChange con lat/lon nuevos y mantiene deltas', () => {
    const onRegionChange = jest.fn();

    render(<MapPicker region={baseRegion} onRegionChange={onRegionChange} draggable />);

    const markers = screen.getAllByTestId('mock-marker');
    const central = markers[0];

    central.props.onDragEnd?.({
      nativeEvent: { coordinate: { latitude: -33.501, longitude: -70.701 } },
    });

    expect(onRegionChange).toHaveBeenCalledWith({
      ...baseRegion,
      latitude: -33.501,
      longitude: -70.701,
    });
  });
});
