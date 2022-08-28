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
