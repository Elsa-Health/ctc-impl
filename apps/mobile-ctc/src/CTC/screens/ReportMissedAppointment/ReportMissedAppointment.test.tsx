import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

import {ThemeProvider} from '@elsa-ui/react-native/theme';

describe('Report Missed Appointment Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <ThemeProvider>
        <Screen
          entry={{myCtcId: '11111111', patientId: '1111111111223232'}}
          actions={{
            checkIfPatientExists: async patientId => false,
            onSubmitReport(report) {},
          }}
        />
      </ThemeProvider>,
    );
  });
});
