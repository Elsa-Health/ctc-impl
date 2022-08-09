import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

import {ThemeProvider} from '@elsa-ui/react-native/theme';
import {ElsaProvider} from '../../../provider/backend';

jest.mock('react-native-qrcode-scanner', () => {
  return {
    default: ({props}: any) => <></>,
  };
});

jest.mock('@react-native-firebase/firestore', () => ({default: jest.fn()}));
jest.mock('@react-native-firebase/auth', () => ({default: jest.fn()}));

describe('QR Authentication Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <ThemeProvider>
        <Screen
          actions={{
            authenticate: async qrCodeDigest => ({
              type: 'v1',
              obj: new ElsaProvider({
                user: {uid: '112', phoneNumber: '01121312'},
                actions: ['read', 'write'],
                facility: {name: '1321', phoneNumber: '21312'},
                identity: {credentialId: '123213', profileId: '131321'},
                platform: 'ctc',
                session: {expiresAt: new Date(), expiresIn: 86400},
              }),
            }),
            onQueryProvider(provider) {},
          }}
        />
      </ThemeProvider>,
    );
  });
});
