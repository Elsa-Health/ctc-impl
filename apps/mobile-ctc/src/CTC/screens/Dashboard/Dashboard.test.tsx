import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

describe('Main Dashboard Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <Screen
        actions={{
          logout: async () => {},
          onNewPatient() {},
          onReportMissedAppointment() {},
          onSearchPatient() {},
          onSeeOtherMedications() {},
          onViewAppointments() {},
          onViewMedications() {},
          onViewMedicationStock() {},
          onViewPatients() {},
          onViewReports() {},
        }}
      />,
    );
  });
});
