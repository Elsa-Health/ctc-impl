import {ctc, Organization} from '@elsa-health/emr';
import {collection} from 'papai/collection';
import {getMockedStore} from '../../../__mocks__/dummy-store';
import {seedStock, stock} from './seed';

describe('Seeding operation', () => {
  test('Works as expected', () => {
    // ...
    expect(
      stock(
        Organization<ctc.Organization>({
          id: 'org-id',
          identifier: {
            ctcCode: '123232',
          },
          name: 'Some DSM Facility',
        }),
      ),
    ).toBeDefined();
  });

  test('Seeding stock information', async () => {
    const store = getMockedStore('DUMMY-STORE');
    const stockCollection = collection<ctc.ARVStockRecord>(store, 'stock-test');

    await expect(
      seedStock(
        stockCollection,
        Organization<ctc.Organization>({
          id: 'org-id',
          identifier: {
            ctcCode: '123232',
          },
          name: 'Some DSM Facility',
        }),
      ),
    ).resolves.not.toThrow();
  });
});
