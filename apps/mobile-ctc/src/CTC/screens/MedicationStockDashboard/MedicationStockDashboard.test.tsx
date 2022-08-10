import React from 'react';

import {render} from '@testing-library/react-native';
import Screen from './index';

describe('Medication Stock Dashboard Screen', () => {
  test('Renders correctly', () => {
    // ....
    render(
      <Screen actions={{onGoToManageStock() {}, onSeeOtherMedications() {}}} />,
    );
  });
});
