import React from 'react';

import {render} from '@testing-library/react-native';
import ConnectionSync, {ConnectionStatus} from './connection-sync';
import {ElsaProvider} from '../../provider/backend';

describe('<ConnectionSync />', () => {
  // ...
  test('Renders correctly', () => {
    render(
      <ConnectionSync
        provider={
          new ElsaProvider({
            user: {uid: '112', phoneNumber: '01121312'},
            actions: ['read', 'write'],
            facility: {name: '1321', phoneNumber: '21312'},
            identity: {credentialId: '123213', profileId: '131321'},
            platform: 'ctc',
            session: {expiresAt: new Date(), expiresIn: 86400},
          })
        }
        wsURL="<websocket-url>"
      />,
    );
  });
});

describe('<ConnectionStatus />', () => {
  // ...
  test('Renders correctly', () => {
    render(<ConnectionStatus />);
  });
});
