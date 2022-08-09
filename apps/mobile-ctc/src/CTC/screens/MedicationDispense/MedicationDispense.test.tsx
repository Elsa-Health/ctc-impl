import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

describe('Medication Dispense Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(<Screen actions={{getMedicationDispenses: () => []}} />);
  });
});
