import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';
import {WorkflowProvider} from '../../workflow';

describe('Report Summary Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <WorkflowProvider>
        <Screen entry={{}} actions={{}} />
      </WorkflowProvider>,
    );
  });
});
