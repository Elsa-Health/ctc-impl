import {getStore} from 'papai/collection';
import ItemStorageCollection from 'papai/stores/collection/ItemStorage';

/**
 * Id generator
 * @returns
 */
export const generateId = () =>
  Buffer.from(`${Math.random() * 1000}-idx-${new Date().getTime()}`).toString(
    'hex',
  );

// Mocking storage
export const getMockedStore = (storeName: string) => {
  const actualStore = new Map();
  const STORE_NAME = storeName;

  return getStore(
    ItemStorageCollection(
      {
        nameReference: STORE_NAME,
        store: {
          getItem: async ref => actualStore.get(ref) ?? null,
          multiGet: async refs =>
            refs.map(
              ref => [ref, actualStore.get(ref) ?? null] as [string, any],
            ),
          setItem: async (ref, data) => {
            actualStore.set(ref, data);
          },
          multiSet: async kvps => {
            kvps.forEach(([k, v]) => actualStore.set(k, v));
          },
          multiRemove: async ref => ref.forEach(ref => actualStore.delete(ref)),
          removeItem: async ref => {
            actualStore.delete(ref);
          },
        },
        getCollRef: ref => `${STORE_NAME}/${ref.collectionId}`,
        getDocRef: ref => `${STORE_NAME}/${ref.collectionId}/${ref.documentId}`,
      },
      // generate
      generateId,
    ),
  );
};
