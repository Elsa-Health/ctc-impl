import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

import {ThemeProvider} from '@elsa-ui/react-native/theme';
import {Patient} from '@elsa-health/emr';

jest.useFakeTimers(); // jest.useFakeTimers('legacy') for jest >= 27
// call animation
jest.runAllTimers();

describe('Edit Patient Screen', () => {
  test('Renders correctly', () => {
    // ....
    const patient = Patient({
      id: 'patient-id',
      birthDate: '1993-03-04',
      sex: 'female',
    });

    render(
      <ThemeProvider>
        <Screen
          entry={{
            patient: {id: patient.id},
            ref: patient,
          }}
          actions={({navigation}) => ({
            checkIfPatientExists(patientId) {},
            onRegisterPatient(patient, investigations, cb?) {},
          })}
        />
      </ThemeProvider>,
    );
  });
});
