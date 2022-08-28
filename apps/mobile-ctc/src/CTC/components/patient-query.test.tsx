import {ThemeProvider} from '@elsa-ui/react-native/theme';
import {render} from '@testing-library/react-native';
import React from 'react';
import {PatientQuery} from './patient-query';

describe('<PatientQuery />', () => {
  test('Renders correctly', () => {
    render(
      <ThemeProvider>
        <PatientQuery />
      </ThemeProvider>,
    );
  });
});
