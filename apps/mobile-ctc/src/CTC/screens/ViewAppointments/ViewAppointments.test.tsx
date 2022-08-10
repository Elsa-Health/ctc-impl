import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {WorkflowProvider} from '../../workflow';
import {List} from 'immutable';

describe('View Appointments Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <WorkflowProvider initialState={{appointments: List<any>([])}}>
        <Screen />
      </WorkflowProvider>,
    );
  });
});
