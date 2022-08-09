import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {Organization, Patient} from '@elsa-health/emr';

describe('<ViewPatient /> Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <Screen
        entry={{
          patient: Patient({
            id: 'patient-id',
            birthDate: '2020-04-26',
            sex: 'female',
          }),
          organization: Organization({
            id: 'org-id',
            identifier: {
              someIdentifier: 'xyz',
            },
            name: 'Organization',
          }),
        }}
        actions={{
          async fetchInvestigationRequests(patientId) {
            return [];
          },
          async fetchVisits(patientId) {
            return [];
          },
          async nextAppointment(patientId) {
            // there is no next appointment
            return null;
          },
          onNewVisit(patient) {},
          onToEditPatient(patient) {},
        }}
      />,
    );
  });
});
