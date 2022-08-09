import React from 'react';

import {render} from '@testing-library/react-native';
import App from './_app';

describe('<App />', () => {
  test('Renders correctly', () => {
    render(<App />);
  });
});
