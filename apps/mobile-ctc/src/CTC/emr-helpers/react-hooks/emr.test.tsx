import React from 'react';

import {render} from '@testing-library/react-native';
import {addDoc, collection} from 'papai/collection';
import {getMockedStore} from '../../../../__mocks__/dummy-store';
import {buildWorkflowStore} from '../../../workflows';
import {WorkflowProvider} from '../../workflow';
import {
  useAttachAppointmentsListener,
  useAttachStockListener,
  useListenCollection,
} from './emr';
import {useAsync} from 'react-use';

describe('Emr Helpers', () => {
  test('Hooks', () => {
    // ..
    const storage = getMockedStore('SOMETHIN GIS EHRE');
    const sx = collection(storage, 'data-for-storagex');
    const Hooks = function () {
      // track changes ...
      useListenCollection('storagex', sx);

      useAsync(async () => {
        await addDoc(sx, {name: 'something', age: 232});
        await addDoc(sx, {name: 'something-else', age: 232});
      }, []);

      return <></>;
    };

    const stockx = collection(storage, 'stock');
    const StockStuff = function () {
      useListenCollection('stock', stockx);
      useAttachStockListener('reporting-stock');
      useAttachAppointmentsListener();

      return <></>;
    };

    render(
      <WorkflowProvider>
        <Hooks />
        <StockStuff />
      </WorkflowProvider>,
    );
  });
});
