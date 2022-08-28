import {getMockedStore} from '../../../__mocks__/dummy-store';
import {mergeUp, syncronize} from './sync';

import {HybridLogicalClock, StateTrackingBox} from 'papai/distributed';

describe('Syncronicity', () => {
  test('mergeUp + syncronize', () => {
    const stateTrackingBox = new StateTrackingBox(
      new HybridLogicalClock('dummy-logical-clock'),
    );

    const data = [
      {collectionId: 'random', documentId: '123'},
      {age: 'name', name: '45'},
      new HybridLogicalClock('other-clock').toString(),
    ];

    const store = getMockedStore('SOMENAME');
    // check statebox
    const output = Array.from(stateTrackingBox.latest());
    console.log('%%%', {output});
    expect(output).toStrictEqual([]);

    // update the statebox
    mergeUp(stateTrackingBox, [data]);

    // update
    expect(Array.from(stateTrackingBox.latest())).toEqual([
      expect.arrayContaining([data[0], data[1]]),
    ]);
    expect(() => syncronize(stateTrackingBox, store)).not.toThrowError();
  });
});
