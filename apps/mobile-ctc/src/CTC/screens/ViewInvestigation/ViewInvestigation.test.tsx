import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {InvestigationRequest, Patient} from '@elsa-health/emr';

describe('ViewInvetigations Screen', () => {
  test('Renders correctly', () => {
    // ...
    const request = InvestigationRequest({
      id: 'request-id',
      data: {someData: 'sdas'},
      subject: Patient({
        id: 'patient-id',
        birthDate: '2020-04-26',
        sex: 'male',
      }),
    });

    render(
      <Screen
        entry={{
          request: {
            id: request.id,
            investigationIdentifier: '1-2-beta-d-glucan',
            investigationName: '1-2-beta-d-glucan',
            obj: request,
          },
        }}
        actions={{
          fetchInvestigationResults: async (investigationId, request) => [],
          async saveResult(results, authorizingRequest) {},
        }}
      />,
    );
  });
});
