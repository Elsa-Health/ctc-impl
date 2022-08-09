import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {Patient, reference, Visit} from '@elsa-health/emr';

describe('Register New Patient Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <Screen
        entry={{
          visit: Visit({
            id: 'visit-id',
            date: new Date().toUTCString(),
            subject: reference(
              Patient({
                id: 'patient-id',
                birthDate: '2020-04-26',
                sex: 'male',
              }),
            ),
          }),
        }}
        actions={{
          onNext: () => {},
          onAddInvestigationResult: () => {},
          onUpdateInvestigationResult: () => {},
        }}
      />,
    );
  });
});
