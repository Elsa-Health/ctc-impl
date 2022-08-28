import {Patient} from '@elsa-health/emr';
import * as ctc from '@elsa-health/emr/lib/ctc/ctc.types';
import {addDoc, collection} from 'papai/collection';
import {getMockedStore} from '../../../__mocks__/dummy-store';
import {queryPatientsFromSearch} from './ui';

describe('Utils', () => {
  test('Searching patients from collection with queryPatientsFromSearch(...)', async () => {
    // ...
    const store = getMockedStore('DUMMYSTORE');
    const patients = collection<ctc.Patient>(store, 'patients');

    await expect(
      queryPatientsFromSearch(
        patients,
        {
          input: '11111111',
          searchIn: {name: false, phone: false},
        },
        item => {
          return item.id;
        },
      ).then(r => r.toArray()),
    ).resolves.toStrictEqual([]);

    const newPatientWithName = Patient<ctc.Patient>({
      id: '11111111234567',
      info: {
        familyName: 'Kevin',
        firstName: 'Leroy',
        address: null,
        phoneNumber: null,
      },
      sex: 'female',
      birthDate: '1996-08-23',
    });
    const newPatientWithNameAndPhoneNumber = Patient<ctc.Patient>({
      id: 'abc',
      info: {
        familyName: 'Kevin',
        firstName: 'LeBron',
        address: null,
        phoneNumber: null,
      },
      contact: {
        phoneNumber: '(+255) 0 768 231 232',
        email: null,
      },
      sex: 'female',
      birthDate: '1996-08-23',
    });

    // patient
    await addDoc(patients, newPatientWithName);
    await addDoc(patients, newPatientWithNameAndPhoneNumber);

    // search patient from id
    await expect(
      queryPatientsFromSearch(
        patients,
        {
          input: '11111111',
          searchIn: {name: false, phone: false},
        },
        item => {
          return item.id;
        },
      ).then(r => r.toArray()),
    ).resolves.toStrictEqual([newPatientWithName.id]);

    // search patient from name
    await expect(
      queryPatientsFromSearch(
        patients,
        {
          input: 'Le',
          searchIn: {name: true, phone: false},
        },
        item => {
          return item.id;
        },
      ).then(r => new Set(r.toArray())),
    ).resolves.toStrictEqual(
      new Set([newPatientWithNameAndPhoneNumber.id, newPatientWithName.id]),
    );
  });
});
