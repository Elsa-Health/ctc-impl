/* eslint-disable react-hooks/exhaustive-deps */
import {onUpdateCollectionDocument, query} from 'papai/collection';

import {List} from 'immutable';
import React from 'react';

import {CollectionNode} from 'papai/collection/core';
import {format} from 'date-fns';

import {date} from '@elsa-health/emr/lib/utils';
import {SingleStockItem} from '../../screens/MedicationStock';
import {ctc} from '@elsa-health/emr';
import {useWorkflowApi, useWorkflowStore} from '../../workflow';

import {Document} from 'papai/collection/types';
import produce from 'immer';

// create medications
// const arvSingleFactory = randomSample.factory(
//   ARVSingles.pairs().map(([singleId, text]) => {
//     // Build the objects
//     return {
//       alias: ARVSingles.fromKey(singleId) ?? singleId,
//       code: 'arv-single',
//       id: 'ctc-arv-single:' + singleId,
//       name: singleId,
//       createdAt: new Date().toISOString(),
//       form: null,
//       data: {
//         singleId,
//         text,
//       },
//       ingredients: [],
//       resourceType: 'Medication',
//     } as ARVSingleMedication;
//   }),
//   {size: 20},
// );

/**
 * Generic listener to a collection
 * @param key
 * @param collection
 */
export function useListenCollection<
  K extends string,
  C extends CollectionNode<Document.Data>,
>(key: K, collection: C) {
  const api = useWorkflowApi();
  const set = React.useCallback(api.getState().setValue, []);

  // initial read
  React.useEffect(() => {
    query(collection).then(vals => {
      set(s =>
        produce(s, df => {
          // setting up the content
          // might want to serialize at this point
          df[key] = vals;
        }),
      );
    });
  }, []);

  // setting up the collection to auto update as needed
  React.useEffect(() => {
    const sub = onUpdateCollectionDocument(collection, function (d) {
      // fires when something changes
      query(collection).then(vals => {
        set(s =>
          produce(s, df => {
            // setting up the content
            // might want to serialize at this point
            df[key] = vals;
          }),
        );
      });
    });

    return () => sub.unsubscribe();
  }, [collection, key]);
}

// export function useStock(emr: EMRModule) {
//   // run seed
//   // setDocs(
//   //   emr.collection('stock'),
//   //   stock().map(d => [d.id, d]),
//   // );

//   // ... use medication stock inforamtion
//   // const [medications, queryMedication] = useCollectionAsWorklet(
//   //   emr.collection('medications'),
//   // );
//   const stockColl = emr.collection('stock');
//   const [{value: stock_}] = useCollectionAsWorklet(stockColl);

//   const setStore = useWorkflowStore(s => s.setValue);

//   React.useEffect(() => {
//     stockColl;
//   }, []);

//   // queryStock();
//   // React.useEffect(() => {
//   //   console.log(stock_);
//   // }, [stock_]);

//   // stock information
//   return {
//     arvs: Object.fromEntries(
//       (stock_ ?? List())
//         .map(d => [
//           d.id,
//           [
//             d.medication.identifier,
//             {
//               count: d.count.toString(),
//               form: d.medication.form,
//               expiresAt: format(date(d.expiresAt), 'dd / MM / yyyy'),
//               ingredients: d.medication.ingredients.map(d => d.identifier),
//               alias: d.medication.alias,
//               type: d.medication.type,
//               estimatedFor: '30-days',
//               identifier: d.medication.identifier,
//               text: d.medication.text,
//               group: d.extendedData?.group ?? 'adults',
//               concentrationValue: null,
//             } as SingleStockItem,
//           ],
//         ])
//         .toArray(),
//     ),
//     // List of medications
//     medications: (stock_ ?? List()).map(d => d.medication).toSet(),
//   };
// }

export function useAttachStockListener(
  reportStockKey: string,
  // stockCollection: any,
) {
  const api = useWorkflowApi();
  const set = api.getState().setValue;
  React.useEffect(() => {
    const unsubscribe = api.subscribe(r => {
      set(s =>
        produce(s, df => {
          const stock = df.stock;

          if (stock === undefined) {
            return;
          }

          // setting up the content
          // might want to serialize at this point
          df[reportStockKey] = {
            arvs: Object.fromEntries(
              stock
                .map(d => [
                  d.id,
                  [
                    d.medication.identifier,
                    {
                      count: d.count.toString(),
                      form: d.medication.form,
                      expiresAt: format(date(d.expiresAt), 'dd / MM / yyyy'),
                      ingredients: d.medication.ingredients.map(
                        d => d.identifier,
                      ),
                      alias: d.medication.alias,
                      type: d.medication.type,
                      estimatedFor: '30-days',
                      identifier: d.medication.identifier,
                      text: d.medication.text,
                      group: d.extendedData?.group ?? 'adults',
                      concentrationValue: null,
                    } as SingleStockItem,
                  ],
                ])
                .toArray(),
            ),
            medications: stock
              .map(d => d.medication)
              .toSet()
              .toArray(),
          };
        }),
      );
    });

    return () => unsubscribe();
  }, []);

  // setting up the collection to auto update as needed
  // React.useEffect(() => {
  //   const sub = onUpdateCollectionDocument(stockCollection, function (d) {
  //     // fires when something changes
  //     query(stockCollection).then(vals => {
  //       set(s =>
  //         produce(s, df => {
  //           // setting up the content
  //           // might want to serialize at this point
  //           df[reportStockKey] = {
  //             arvs: Object.fromEntries(
  //               vals
  //                 .map(d => [
  //                   d.id,
  //                   [
  //                     d.medication.identifier,
  //                     {
  //                       count: d.count.toString(),
  //                       form: d.medication.form,
  //                       expiresAt: format(date(d.expiresAt), 'dd / MM / yyyy'),
  //                       ingredients: d.medication.ingredients.map(
  //                         d => d.identifier,
  //                       ),
  //                       alias: d.medication.alias,
  //                       type: d.medication.type,
  //                       estimatedFor: '30-days',
  //                       identifier: d.medication.identifier,
  //                       text: d.medication.text,
  //                       group: d.extendedData?.group ?? 'adults',
  //                       concentrationValue: null,
  //                     } as SingleStockItem,
  //                   ],
  //                 ])
  //                 .toArray(),
  //             ),
  //             medications: vals
  //               .map(d => d.medication)
  //               .toSet()
  //               .toArray(),
  //           };
  //         }),
  //       );
  //     });
  // });

  // return () => sub.unsubscribe();
  // }, [stockCollection]);
}

export type Appointment = {
  requestId: string;
  requestDate: UTCDateTimeString;
  originVisitId: string | null;
  request: CTC.AppointmentRequest;
  participants: Array<Referred<ctc.Patient> | Referred<ctc.Doctor>>;
} & (
  | {type: 'not-responded'; responseDate: null; response: null}
  | {
      type: 'responded';
      responseDate: UTCDateTimeString;
      response: CTC.AppointmentResponse;
    }
);

export function useAttachAppointmentsListener() {
  const api = useWorkflowApi();
  const set = React.useCallback(api.getState().setValue, []);

  // const apptResps = api.getState().value['appointment-responses'];
  // const apptRqs = api.getState().value['appointment-requests'];

  const apptRespsRef = React.useRef(
    api.getState().value['appointment-responses'],
  );
  const apptRqsRef = React.useRef(api.getState().value['appointment-requests']);

  // Connect to the store on mount, disconnect on unmount, catch state-changes in a reference
  React.useEffect(
    () =>
      api.subscribe(state => {
        apptRespsRef.current = state.value['appointment-responses'];
        apptRqsRef.current = state.value['appointment-requests'];
      }),
    [],
  );

  React.useEffect(() => {
    const apptResps = apptRespsRef.current;
    const apptRqs = apptRqsRef.current;

    set(s =>
      produce(s, df => {
        df['appointments'] = (apptRqs ?? List()).map(d => {
          const dx = apptResps.find(
            f => f.authorizingAppointmentRequest.id === d.id,
          );

          const obj = {
            requestId: d.id,
            originVisitId: d.visit?.id ?? null,
            requestDate: d.appointmentDate,
            request: d,
            participants: d.participants,
          };

          if (dx !== undefined) {
            return {
              ...obj,
              responseDate: dx.createdAt,
              type: 'responded',
              response: dx,
            } as Appointment;
          }

          // check va
          return {
            ...obj,
            type: 'not-responded',
            response: null,
          } as Appointment;
        });
      }),
    );
  }, [apptRespsRef, apptRqsRef]);
}

// export function useAppointments(emr: EMRModule) {
//   // ...
//   const [{value: apptRqs}, q_] = useCollectionAsWorklet(
//     emr.collection('appointment-requests'),
//   );
//   const [{value: apptResps}, qrs_] = useCollectionAsWorklet(
//     emr.collection('appointment-responses'),
//   );

//   // appointment records
//   const appointments = useSharedValue<List<Appointment> | null>(null);

//   // appointment requests
//   // ...
//   React.useEffect(() => {
//     'worklet';
//     const baseReps = apptResps ?? List();

//     // update the values
//     appointments.value =
//       (apptRqs ?? List()).map(d => {
//         const dx = baseReps.find(
//           f => f.authorizingAppointmentRequest.id === d.id,
//         );

//         const obj = {
//           requestId: d.id,
//           originVisitId: d.visit?.id ?? null,
//           requestDate: d.appointmentDate,
//           request: d,
//           participants: d.participants,
//         };

//         if (dx !== undefined) {
//           return {
//             ...obj,
//             responseDate: dx.createdAt,
//             type: 'responded',
//             response: dx,
//           } as Appointment;
//         }

//         // check va
//         return {
//           ...obj,
//           type: 'not-responded',
//           response: null,
//         } as Appointment;
//       }) ?? null;
//   }, [appointments, apptResps, apptRqs]);

//   return {
//     'appointment-requests': apptRqs,
//     'appointment-responses': apptResps,
//     appointments: appointments.value ?? List(),
//   };
// }
