import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {WorkflowProvider} from '../../workflow';

describe('View Appointments Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <WorkflowProvider>
        <Screen />
      </WorkflowProvider>,
    );
  });
});
