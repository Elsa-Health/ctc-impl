import * as ctc from '@elsa-health/emr/lib/ctc/ctc.types';
import {query} from 'papai/collection';
import {CollectionNode} from 'papai/collection/core';
import {lower, removeWhiteSpace} from '../emr-helpers/utils';
import {SearchQuery} from '../screens/PatientDashboard/PatientDashboard.screen';

export async function queryPatientsFromSearch<T>(
  patientCollection: CollectionNode<ctc.Patient>,
  searchQuery: SearchQuery,
  item: (p: ctc.Patient) => T,
) {
  const orQueries: Array<(p: ctc.Patient) => boolean> = [];
  const {input: preFormatInput, searchIn} = searchQuery;
  if (preFormatInput !== undefined) {
    const input = preFormatInput.trim().toLowerCase();
    // add function to search ID
    orQueries.push(p => {
      //  search in ID
      if (input.trim().length === 0) {
        return true;
      }

      return (p.id ?? '').includes(input.trim());
    });

    // add function to search from name
    if (searchIn?.name) {
      orQueries.push(p => {
        const firstName = lower((p.info?.firstName ?? '').trim());
        const familyName = lower((p.info?.familyName ?? '').trim());
        const fullName = lower(`${firstName} ${familyName}`.trim());

        return (
          firstName.includes(input) ||
          familyName.includes(input) ||
          fullName.includes(input)
        );
      });
    }

    // search phoneNumber
    if (searchIn?.phone) {
      // console.log('Phone Q');
      orQueries.push(p => {
        const phoneNumber = p.contact?.phoneNumber ?? '';
        return removeWhiteSpace(phoneNumber).includes(removeWhiteSpace(input));
      });
    }
  }

  // console.log(query);
  return query(patientCollection, {
    where: {
      $or: orQueries,
    },
    order: {
      type: 'desc',
      field: p => new Date(p.createdAt).getTime(),
    },
  }).then(ps => ps.map(item));
}
