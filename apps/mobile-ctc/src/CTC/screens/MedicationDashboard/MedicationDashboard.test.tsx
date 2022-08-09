import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

describe('Medication Dashboard Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <Screen
        actions={{
          onShowAllMedicationDispenses() {},
          onShowMedicationRequest(medicationRequest) {},
          getMedicationDispenseFrom: async medicationRequest => null,
          getMedicationRequests: async () => [],
          getPatientsToRequestFor: () => [],
        }}
      />,
    );
  });
});
