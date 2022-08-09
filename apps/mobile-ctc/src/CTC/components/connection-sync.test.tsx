import React from 'react';

import {render} from '@testing-library/react-native';
import ConnectionSync, {ConnectionStatus} from './connection-sync';

describe('<ConnectionSync />', () => {
  // ...
  test('Renders correctly', () => {
    render(<ConnectionSync />);
  });
});

describe('<ConnectionStatus />', () => {
  // ...
  test('Renders correctly', () => {
    render(<ConnectionStatus />);
  });
});
