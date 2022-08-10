import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {WorkflowProvider} from '../../workflow';

describe('Patient Dashboard Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <WorkflowProvider>
        <Screen
          actions={{
            getPatientsFromQuery: async query => [],
            onNewPatient() {},
            getMyCTCId: () => 'sdsds',
          }}
        />
      </WorkflowProvider>,
    );
  });
});
