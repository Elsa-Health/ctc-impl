import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {Organization} from '@elsa-health/emr';
import {List} from 'immutable';
import {act} from 'react-test-renderer';

describe('Medication Map Screen', () => {
  const organization = Organization({
    id: 'org-id',
    identifier: {
      someIdentifier: 'xyz',
    },
    name: 'Organization',
  });

  test('Renders correctly', () => {
    // ....
    render(
      <Screen
        entry={{organization}}
        actions={{
          fetchPublicStock: async () => List([]),
          onGoToUpdateStock() {},
        }}
      />,
    );
  });
});
