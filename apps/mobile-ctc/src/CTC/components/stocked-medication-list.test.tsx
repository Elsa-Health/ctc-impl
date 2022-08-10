import React from 'react';
import {render} from '@testing-library/react-native';
import {StockedMedicationList} from './stocked-medication-list';
import {ThemeProvider} from '@elsa-ui/react-native/theme';

describe('<StockedMedicationList />', () => {
  test('Render correctly', () => {
    // ...
    render(
      <ThemeProvider>
        <StockedMedicationList />
      </ThemeProvider>,
    );
  });
});
