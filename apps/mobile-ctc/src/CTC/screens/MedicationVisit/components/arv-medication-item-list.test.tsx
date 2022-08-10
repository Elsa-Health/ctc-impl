import React from 'react';

import {render} from '@testing-library/react-native';
import ARVMedicationItemList from './arv-medication-item-list';
import {ThemeProvider} from '@elsa-ui/react-native/theme';

describe('ARVMedicationItemList component', () => {
  test('show=false; Renders correctly', () => {
    render(
      <ThemeProvider>
        <ARVMedicationItemList
          collection={jest.fn()}
          dismiss={jest.fn()}
          onSelectedItems={jest.fn()}
          show={false}
        />
      </ThemeProvider>,
    );
  });

  test('show=true; Renders correctly', () => {
    render(
      <ThemeProvider>
        <ARVMedicationItemList
          collection={jest.fn()}
          dismiss={jest.fn()}
          onSelectedItems={jest.fn()}
          show={true}
        />
      </ThemeProvider>,
    );
  });
});
