// Shims para módulos sin tipos en el entorno de tests
declare module 'react-native-reanimated/mock' {
  const ReanimatedMock: any;
  export = ReanimatedMock;
}

declare module 'react-native-gesture-handler/jestSetup' {
  const setup: any;
  export = setup;
}
