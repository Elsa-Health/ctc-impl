import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {Organization, Patient} from '@elsa-health/emr';
import {getMockedStore} from '../../../../__mocks__/dummy-store';
import {collection} from 'papai/collection';
import {WorkflowProvider} from '../../workflow';
import {ThemeProvider} from '@elsa-ui/react-native/theme';

describe('Medication Visit Screen', () => {
  const store = getMockedStore('DUMMY-STORE');

  test('Renders correctly', () => {
    // ....
    render(
      <ThemeProvider>
        <WorkflowProvider>
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
              async fetchAppointments(patientId) {
                return {};
              },
              getStockCollectionNode: () => collection(store, 'stock'),
              onDiscard() {},
            }}
          />
        </WorkflowProvider>
      </ThemeProvider>,
    );
  });
});
