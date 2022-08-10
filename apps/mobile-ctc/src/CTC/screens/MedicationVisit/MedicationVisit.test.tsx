import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {Organization, Patient} from '@elsa-health/emr';

describe('Medication Visit Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <Screen
        entry={{
          patient: Patient({
            id: '<patient-id>',
            birthDate: '1993-03-04',
            sex: 'female',
          }),
          initialState: null,
          organization: Organization({
            id: '<org-id>',
            identifier: {someIdentifier: 'assdasds'},
            name: 'Random Organization Name',
          }),
        }}
        actions={{
          async complete(data, patient, organization, visit) {},
          fetchAppointments(patientId) {},
          getStockCollectionNode() {},
          onDiscard() {},
        }}
      />,
    );
  });
});
