/* eslint-disable @typescript-eslint/no-unused-vars */
import {ElsaProvider} from '../../provider/backend';
import {fetchCRDTMessages, StockState, syncContentsFromSocket} from './socket';

import {getMockedStore} from '../../../__mocks__/dummy-store';
import {addDoc, collection} from 'papai/collection';
import {StateMessage} from './sync';
import {HybridLogicalClock} from 'papai/distributed';

describe('Socket related executions', () => {
  test('syncContentsFromSocket', () => {
    const stockData: StockState = {
      facility: '13123123',
      type: 'stock',
      stock: [],
      timestamp: new Date().toISOString(),
    };

    const crdtMessage: StateMessage = {
      type: 'crdt',
      tokens: [
        [
          {collectionId: 'person', documentId: '123'},
          {age: '123', name: 'John Doe'},
          new HybridLogicalClock('<rand-clock>').toString(),
        ],
      ],
      source: {
        facility: '13123123',
        user: {uid: '18998039899810898289'},
        deviceId: '<this-device>',
      },
    };
    expect(() => syncContentsFromSocket(stockData)).not.toThrowError();
    expect(() => syncContentsFromSocket(crdtMessage)).not.toThrowError();
    expect(() =>
      syncContentsFromSocket({type: 'invalid-data', something: 'is here!'}),
    ).toThrowError(
      new Error("You shouldn't even see this. If you can, 503 error"),
    );
  });

  test('fetchCRDTMessages from crdtCollection', async () => {
    // ...
    const provider = new ElsaProvider({
      user: {uid: '112', phoneNumber: '01121312'},
      actions: ['read', 'write'],
      facility: {name: '1321', phoneNumber: '21312', ctcCode: 'CTC-CODE'},
      identity: {credentialId: '123213', profileId: '131321'},
      platform: 'ctc',
      session: {expiresAt: new Date(), expiresIn: 86400},
    });

    const store = getMockedStore('DUMMYSTORE');
    const crdtCollection = collection<{
      state?: any;
      refOrigin: {collectionId: string; documentId: string};
      clock: string;
    }>(store, 'crdtcollection');

    // expect.assertions(2);
    // await expect(fetchCRDTMessages(provider)).resolves.toBe(null);
    await expect(fetchCRDTMessages(provider, crdtCollection)).resolves.toBe(
      null,
    );

    const data = {
      state: 'something',
      refOrigin: {collectionId: 'abc', documentId: '123'},
      clock: 'clock-here',
    };

    // add to crdt collection
    const _id = await addDoc(crdtCollection, data);

    await expect(
      fetchCRDTMessages(provider, crdtCollection),
    ).resolves.toStrictEqual({
      type: 'crdt',
      batch: [[data.refOrigin, data.state, data.clock]],
      source: {facility: provider.facility.ctcCode, userId: provider.user.uid},
    });
  });
});
