import {Module} from '@elsa-health/emr/lib/module';
import {Store} from 'papai/collection/core';

import {StockRecord} from '@elsa-health/emr/health.types/v1';

import {
  collection,
  doc,
  getStore,
  onUpdateCollectionDocument,
  setDoc,
} from 'papai/collection';
import {HybridLogicalClock} from 'papai/distributed/clock';
import {
  onTrackNewStoreChanges,
  StateTrackingBox,
} from 'papai/distributed/store';
import ItemStorageStore, {
  AsyncItemStorage,
} from 'papai/stores/collection/ItemStorage';

import FastAsyncStorage from 'react-native-fast-storage';

import uuid from 'react-native-uuid';
import {CTC} from './types';

import AsyncStorage from '@react-native-async-storage/async-storage';
// ... seed
import {seedStock} from './seed';
import {Message} from '../actions/sync';
import {ElsaProvider} from '../../provider/backend';

// reference mapping the state to the values

// replace ':' to a different string
export const stateClock = new HybridLogicalClock(
  `elsa-client-dev-${uuid.v4()}`,
);
export const stateBox = new StateTrackingBox(stateClock); // distributedStateBox

function BuildItemStore(name: string, store: AsyncItemStorage) {
  const STORE_NAME = name;
  // Create store to be used
  return getStore(
    // KeyValueMapStore(() => uuid.v4() as string),
    ItemStorageStore(
      {
        nameReference: STORE_NAME,
        getCollRef: d => `${STORE_NAME}/${d.collectionId}`,
        getDocRef: d => `${STORE_NAME}/${d.collectionId}/${d.documentId}`,
        store,
      },
      () => uuid.v4() as string,
    ),
  );
}

// const STORE_NAME = 'DEV_TEST_STORE@TEMP';
// const STORE_NAME = 'STORAGE@CTC';

const storage = BuildItemStore('STORAGE@CTC', FastAsyncStorage);
/**
 * Storage component
 * @returns
 */
export const getStorage = () => storage;
/**
 * This should store things that' you don't want shared over the network
 */
const privateStorage = BuildItemStore('PRIVATE-STORAGE@CTC', FastAsyncStorage);
export const getPrivateStore = () => privateStorage;

export type PublicStock = {
  source: {facility: string; userId: string};
  timestamp: string;
  record: {medicationIdentifier: string; count: number; text: string};
};

// type DEV_Stock = StockRecord<CTC.ARVMedication, CTC.Organization>;

/**
 * @param publicStore Store providing the data
 * @returns module to control the values
 */
export const EMRModule = (
  publicStore: Store,
  privateStore: Store,
  provider: ElsaProvider,
) => {
  // This is the private storage to adress stock information
  const stock = collection<ctc.ARVStockRecord>(
    privateStore,
    'medication.stock',
  );

  const publicStock = collection<PublicStock>(
    publicStore,
    'public.network.stock',
  );

  const {
    facility: {ctcCode = 'UNKNOWN'},
    user: {uid: userId},
  } = provider.toJSON();

  // Create subscription
  onUpdateCollectionDocument(stock, function (d) {
    // this becomes problematic as it's fire and forget
    //  (no queueing of transactions or anything)

    // You might need to rethink your storage options
    setDoc(doc(publicStock, `${ctcCode}$${d.id}`), {
      timestamp: new Date().toUTCString(),
      record: {
        count: d.count,
        medicationIdentifier: d.medication.identifier,
        text: d.medication.text,
      },
      source: {facility: ctcCode, userId},
    });
  });

  const module = new Module({
    visits: collection<CTC.Visit>(publicStore, 'visits'),
    patients: collection<CTC.Patient>(publicStore, 'patients'),

    /**
     * Stock of the medications
     * -------
     * <Using Private Store>
     */
    stock,

    /**
     * Publicly available information about the stock available for the other clients on the network
     */
    publicStock,

    /**
     * Note: This medication item is intended
     * for use with other things
     */
    medications: collection<CTC.ARVMedication>(
      publicStore,
      'medications.items',
    ),

    /**
     * Contains the mediction requests
     */
    'medication-requests': collection<CTC.MedicationRequest>(
      publicStore,
      'medication.requests',
    ),
    /**
     * Contains the mediction requests
     */
    'medication-dispenses': collection<CTC.MedicationDispense>(
      publicStore,
      'medication.dispenses',
    ),

    /**
     * Appointment requests
     */
    'appointment-requests': collection<CTC.AppointmentRequest>(
      publicStore,
      'appointment-requests',
      // 'appt.requests',
    ),

    /**
     * Appointment responses
     */
    'appointment-responses': collection<CTC.AppointmentResponse>(
      publicStore,
      'appt.responses',
    ),

    // Investigation related collections
    /**
     * Investigation Requests
     */
    'investigation-requests': collection<CTC.InvestigationRequest>(
      publicStore,
      'investigation.requests',
    ),

    'investigation-results': collection<CTC.InvestigationResult>(
      publicStore,
      'investigation.results',
    ),

    /**
     * Reports related information
     */
    reports: collection<CTC.Report.MissedAppointment>(publicStore, 'reports'),
  });

  return module;
};

/**
 * Pull the crdt collection endpoint
 * @returns
 */
export const getCrdtCollection = () =>
  collection<Message>(getPrivateStore(), 'crdt-messages');

/**
 * Get EMR
 */
export const getEMR = (provider: ElsaProvider) =>
  EMRModule(storage, privateStorage, provider);
export type EMRModule = ReturnType<typeof getEMR>;

// PERFORM seeding

export async function Seeding(emr: EMRModule, org: CTC.Organization) {
  const seedKey = 'STORAGE@SEED-ONCE-NOW-PROPER';

  // make sure the seeding happens
  return AsyncStorage.getItem(seedKey).then(async isToSeed => {
    if (isToSeed !== null) {
      console.log('Not seeding...');
      return;
    }

    const ou = isToSeed !== null ? JSON.parse(isToSeed) : null;
    // console.log({isToSeed, ou});
    if (ou !== null) {
      console.log('Not seeding...');
      return;
    }

    // await clearCollection(emr.collection('stock'));
    // await clearCollection(emr.collection('publicStock'));

    console.log('Seeding...');
    // run seed for stock + // then lock after first run
    return seedStock(emr.collection('stock'), org).then(() =>
      AsyncStorage.setItem(seedKey, JSON.stringify(true)),
    );
  });
}

/**
 * Subscribe to the changes that are going on
 * in the application
 */

import {addDoc} from 'papai/collection';
import {CRDTState} from '../actions/socket';
import {ctc} from '@elsa-health/emr';

// set observable on document change
const store = getStorage();
store.documentObservable.subscribe(function (val) {
  // ...
  if (val.action === 'updated') {
    addDoc(getCrdtCollection(), {
      refOrigin: val.ref,
      state: val.state,
      clock: HybridLogicalClock.stringify(stateClock.next()),
    });
  }
});

// sync up the stores
export function onSnapshotUpdate(
  store_: ReturnType<typeof getStorage>,
  provider: ElsaProvider,
  cb: (message: CRDTState) => void,
) {
  const {
    facility: {ctcCode = 'UNKNOWN'},
    user: {uid: userId},
  } = provider.toJSON();
  return onTrackNewStoreChanges(
    store_,
    stateBox,
    function (_doc, state, clock) {
      // ...
      cb({
        type: 'crdt',
        batch: [[_doc, state, clock.toString()]],
        source: {facility: ctcCode, userId},
      });
    },
  );
}
