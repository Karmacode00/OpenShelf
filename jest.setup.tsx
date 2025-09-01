import 'react-native-gesture-handler/jestSetup';

import * as mockReact from 'react';
import {
  View as mockView,
  TouchableOpacity as mockTouchableOpacity,
  TouchableHighlight as mockTouchableHighlight,
  TouchableWithoutFeedback as mockTouchableWithoutFeedback,
} from 'react-native';
import mockReanimated from 'react-native-reanimated/mock';

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
  getAuth: jest.fn(() => ({ currentUser: { uid: 'test-user' } })),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn((_storage: any, path: string) => ({ _path: String(path) })),
  uploadBytes: jest.fn(async () => undefined),
  getDownloadURL: jest.fn(async () => 'https://mockstorage.local/o/some%2Fpath.jpg?alt=media'),
  deleteObject: jest.fn(async () => undefined),
}));

jest.mock('firebase/firestore', () => {
  const defaultSnap = {
    exists: () => false,
    data: () => ({}),
  };

  let __autoId = 0;
  const makeAutoId = () => `gen-${++__autoId}`;

  const makeCollPath = (...segs: string[]) => `/${segs.join('/')}`;

  const makeDocRefFromColl = (collObj: any, id?: string) => {
    const _id = id ?? makeAutoId();
    return { _path: `${collObj._path}/${_id}`, id: String(_id) };
  };

  return {
    doc: jest.fn((first: any, second?: string, third?: string) => {
      if (third) {
        return { _path: `/${second}/${third}`, id: String(third) };
      }
      if (first && first._path) {
        return makeDocRefFromColl(first, second);
      }
      return { _path: '/unknown/unknown', id: 'unknown' };
    }),

    collection: jest.fn((_db: any, ...segs: string[]) => ({ _path: makeCollPath(...segs) })),
    collectionGroup: jest.fn((_db: any, sub: string) => ({ _cgPath: `/__cg__/${sub}` })),

    query: jest.fn((...args: any[]) => ({ _q: args })),
    where: jest.fn((f: string, op: any, v: any) => ['where', f, op, v]),
    limit: jest.fn((n: number) => ['limit', n]),
    onSnapshot: jest.fn(),

    addDoc: jest.fn(async () => ({ id: 'doc-id' })),
    setDoc: jest.fn(async () => undefined),
    getDoc: jest.fn(async () => defaultSnap),
    getDocs: jest.fn(async () => ({ docs: [], empty: true, size: 0 })),

    runTransaction: jest.fn(async (_db: any, updateFn: any) => {
      const tx = {
        get: jest.fn(async () => defaultSnap),
        set: jest.fn(async () => undefined),
        update: jest.fn(async () => undefined),
        delete: jest.fn(async () => undefined),
      };
      return updateFn(tx);
    }),

    orderBy: jest.fn((f: string, dir?: 'asc' | 'desc') => ['orderBy', f, dir]),
    startAt: jest.fn((v: any) => ['startAt', v]),
    endAt: jest.fn((v: any) => ['endAt', v]),
    documentId: jest.fn(() => '__name__'),

    serverTimestamp: jest.fn(() => 'server-ts'),
  };
});

jest.mock('geofire-common', () => ({
  geohashForLocation: jest.fn(() => 'geohash-mock'),
  geohashQueryBounds: jest.fn(() => [['aaa', 'aaz']]),
  distanceBetween: jest.fn(() => 0),
}));

jest.mock('@/services/firebase', () => ({
  auth: { __brand: 'auth' },
  db: { __brand: 'db' },
  storage: { __brand: 'storage' },
}));

if (!(global as any).fetch) {
  (global as any).fetch = jest.fn(async () => ({
    blob: async () => 'blob-data',
    json: async () => ({}),
    text: async () => '',
    ok: true,
    status: 200,
  }));
}

jest.mock('react-native-reanimated', () => ({
  ...mockReanimated,
  default: mockReanimated,
  __esModule: true,
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: mockView,
  TouchableOpacity: mockTouchableOpacity,
  TouchableHighlight: mockTouchableHighlight,
  TouchableWithoutFeedback: mockTouchableWithoutFeedback,
}));

jest.mock('react-native-maps', () => {
  const MockMap = mockReact.forwardRef((props: any, ref: any) => {
    const fitToCoordinates = jest.fn();
    const animateToRegion = jest.fn();
    mockReact.useImperativeHandle(ref, () => ({
      fitToCoordinates,
      animateToRegion,
      __calls: { fitToCoordinates, animateToRegion },
    }));
    return mockReact.createElement(mockView, { testID: 'mock-map', ...props });
  });

  const Marker = (p: any) => mockReact.createElement(mockView, { testID: 'mock-marker', ...p });

  return { __esModule: true, default: MockMap, Marker };
});

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  Accuracy: { High: 3, Balanced: 2, Low: 1 },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  Link: ({ children }: any) => children,
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = (props: any) => React.createElement(View, { testID: 'icon', ...props });
  return { __esModule: true, Ionicons: Icon };
});

jest.mock('@hooks/useThemeColor', () => ({
  useThemeColor: jest.fn((_p: any, token: string) => {
    if (token === 'card') return 'cardColor';
    if (token === 'tint') return 'tintColor';
    if (token === 'accent') return 'accentColor';
    if (token === 'textContrast') return 'contrastColor';
    if (token === 'buttonSecondary') return 'btnSecondary';
    if (token === 'buttonSecondaryText') return 'btnSecondaryText';
    return 'color';
  }),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    easConfig: { projectId: 'proj-1' },
    expoConfig: { extra: { eas: { projectId: 'proj-1' } } },
  },
}));

jest.mock('firebase/app', () => ({
  getApp: jest.fn(() => ({ __brand: 'app' })),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({ __brand: 'fns' })),
  httpsCallable: jest.fn(), // lo configuramos por-test
}));
