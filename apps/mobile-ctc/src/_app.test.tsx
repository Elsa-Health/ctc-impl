import React from 'react';

import {render} from '@testing-library/react-native';
import App from './_app';

jest.mock('react-native-qrcode-scanner', () => {
  return {
    default: jest.fn().mockImplementation(() => <></>),
  };
});
jest.mock('@react-native-firebase/firestore', () => ({default: jest.fn()}));
jest.mock('@react-native-firebase/auth', () => ({default: jest.fn()}));

describe('<App />', () => {
  test('Renders correctly', () => {
    render(<App />);
  });
});
