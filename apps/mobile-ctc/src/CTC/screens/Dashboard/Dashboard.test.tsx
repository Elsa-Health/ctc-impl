import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {WorkflowProvider} from '../../workflow';

describe('Main Dashboard Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <WorkflowProvider>
        <Screen
          entry={{}}
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
        />
        ,
      </WorkflowProvider>,
    );
  });
});
