import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {
  ctc,
  Medication,
  MedicationRequest,
  Patient,
  referred,
} from '@elsa-health/emr';
import {WorkflowProvider} from '../../workflow';

describe('Medication Request Screen', () => {
  test('Renders correctly', () => {
    // ....
    const request = MedicationRequest<ctc.MedicationRequest>({
      id: 'medication-request-id',
      subject: referred(
        Patient({
          id: 'patient-id',
          birthDate: '2034-03-12',
          sex: 'male',
        }),
      ),
      supplyInquiry: null,
      authoredOn: new Date().toISOString(),
      medication: Medication<ctc.ARVMedication>({
        form: 'tablets',
        identifier: 'arv',
      }),
    });
    render(
      <WorkflowProvider>
        <Screen
          entry={{request}}
          actions={{
            onAcceptMedicationRequest(medicationRequest, finish) {
              // ...
            },
            onIgnoreRequest() {
              // ...
            },
          }}
        />
      </WorkflowProvider>,
    );
  });
});
