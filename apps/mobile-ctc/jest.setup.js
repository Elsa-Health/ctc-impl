jest.mock('react-native-permissions', () =>
  jest.requireActual('react-native-permissions/mock'),
);

jest.mock('@sentry/react-native', () => ({
  default: jest.fn(),
  captureEvent: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({goBack: jest.fn()}),
  useRoute: () => ({
    params: {},
  }),
}));

/**
 * Firebase
 * -----------
 */
jest.mock('@react-native-firebase/firestore', () => {
  return () => ({});
});

// jest.mock('@react-native-firebase/messaging', () => {
//   const messagingModule = () => ({
//     getToken: jest.fn(() => Promise.resolve('myMockToken')),
//     setBackgroundMessageHandler: jest.fn(),
//     onMessage: jest.fn(),
//     requestPermission: jest.fn(),
//     onNotificationOpenedApp: jest.fn(),
//   });
//   messagingModule.AuthorizationStatus = {
//     NOT_DETERMINED: -1,
//     DENIED: 0,
//     AUTHORIZED: 1,
//     PROVISIONAL: 2,
//   };
//   return messagingModule;
// });

jest.mock('@react-native-firebase/analytics', () => {
  return () => ({
    logEvent: jest.fn(),
    setUserProperties: jest.fn(),
    setUserId: jest.fn(),
    setCurrentScreen: jest.fn(),
  });
});

/** ------------------- */

jest.mock('react-native-paper', () => {
  return {
    ...jest.requireActual('react-native-paper'),
    TextInput: jest.requireActual('react-native').TextInput,
  };
});

jest.mock('react-native-text-input-mask', () => ({
  default: jest.fn(),
}));

jest.mock('react-native-fast-storage', () => ({
  default: jest.fn(),
}));

jest.mock('react-native-fast-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);
jest.mock('react-native-file-viewer', () => ({
  default: jest.fn(),
}));
jest.mock('react-native-html-to-pdf', () => ({
  default: jest.fn(),
}));

/**
 * https://docs.swmansion.com/react-native-reanimated/docs/guide/testing/
 */
require('react-native-reanimated/lib/reanimated2/jestUtils').setUpTests();
