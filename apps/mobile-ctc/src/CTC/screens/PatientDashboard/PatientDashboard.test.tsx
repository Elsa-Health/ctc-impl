import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

describe('Patient Dashboard Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <Screen
        actions={{
          getPatientsFromQuery: async query => [],
          onNewPatient() {},
          getMyCTCId: () => 'sdsds',
        }}
      />,
    );
  });
});
