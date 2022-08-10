import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {WorkflowProvider} from '../../workflow';
import {ThemeProvider} from '@elsa-ui/react-native/theme';

describe('Patient Dashboard Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <ThemeProvider>
        <WorkflowProvider>
          <Screen
            entry={{}}
            actions={{
              getPatientsFromQuery: async query => [],
              onNewPatient() {},
              getMyCTCId: () => 'sdsds',
            }}
          />
        </WorkflowProvider>
      </ThemeProvider>,
    );
  });
});
