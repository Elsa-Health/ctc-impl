import React from 'react';

import {render} from '@testing-library/react-native';
import ARVMedicationItemList from './arv-medication-item-list';
import {ThemeProvider} from '@elsa-ui/react-native/theme';
import {getMockedStore} from '../../../../../__mocks__/dummy-store';
import {collection} from 'papai/collection';

describe('ARVMedicationItemList component', () => {
  const store = getMockedStore('DUMMY_STORE');
  const medicationCollection = collection(store, 'arv-medications');
  test('show=false; Renders correctly', () => {
    render(
      <ThemeProvider>
        <ARVMedicationItemList
          collection={() => medicationCollection}
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
          collection={() => medicationCollection}
          dismiss={jest.fn()}
          onSelectedItems={jest.fn()}
          show={true}
        />
      </ThemeProvider>,
    );
  });
});
