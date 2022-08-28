import {ctc, Organization} from '@elsa-health/emr';
import {addDoc, collection} from 'papai/collection';
import {getMockedStore} from '../../../__mocks__/dummy-store';
import {ElsaProvider} from '../../provider/backend';
import {
  EMRModule,
  getCrdtCollection,
  getPrivateStore,
  getStorage,
  onSnapshotUpdate,
  Seeding,
} from './store';

describe('Something', () => {
  const elsa_provider = new ElsaProvider({
    user: {uid: '112', phoneNumber: '01121312'},
    actions: ['read', 'write'],
    facility: {name: '1321', phoneNumber: '21312'},
    identity: {credentialId: '123213', profileId: '131321'},
    platform: 'ctc',
    session: {expiresAt: new Date(), expiresIn: 86400},
  });
  test('base storage', () => {
    expect(getStorage()).toBeDefined();
    expect(getPrivateStore()).toBeDefined();
    expect(getCrdtCollection()).toBeDefined();
    // ...
  });

  test('EMR', async () => {
    const emr = EMRModule(
      getMockedStore('StoreA'),
      getMockedStore('StoreB'),
      elsa_provider,
    );

    // emr module
    expect(emr).toBeDefined();

    // seeding functions
    await expect(
      Seeding(
        emr,
        Organization<ctc.Organization>({
          id: 'org-id',
          identifier: {
            ctcCode: '1231232',
          },
          name: 'Something is here!',
        }),
      ),
    ).resolves.not.toThrow();
  });

  test('EMR > listen to snapshot', async () => {
    // ...
    //
    const store = getMockedStore('THE-FAKE-STORE');
    const cx = collection(store, 'fun');

    const dummyRecord = {name: 'something', age: 23};
    onSnapshotUpdate(store, elsa_provider, function ({batch, source, type}) {
      // ...
      //   expect(tx).toBeDefined();
      expect(type).toBe('crdt');
      expect(source).toStrictEqual({
        facility: elsa_provider.facility.ctcCode,
        userId: elsa_provider.user.uid,
      });
      expect(batch).toStrictEqual([
        [
          {collectionId: 'fun', documentId: expect.any(String)},
          dummyRecord,
          expect.any(String),
        ],
      ]);
    });

    // add information + trigger
    await addDoc(cx, dummyRecord);
  });
});
