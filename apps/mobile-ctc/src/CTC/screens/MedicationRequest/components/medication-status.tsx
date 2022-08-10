import {ctc} from '@elsa-health/emr';
import {List} from 'immutable';
import React from 'react';
import {
  isOutOfStock,
  isStockLow,
} from '../../../components/stocked-medication-list';
import {Section} from '../../../temp-components';
import {useWorkflowApi} from '../../../workflow';

type AvailabilityStatus = 'available' | 'unavailable' | 'unknown';

/**
 * Using the `stock` data, checks status of the `medication`
 * @param medication Medication wanted to look status for
 * @param stock medication stock data that's used to determine status for the medication
 * @returns
 */
const checkStockStatus = (
  medication: ctc.ARVMedication,
  stock: List<ctc.ARVStockRecord>,
): {status: AvailabilityStatus; title: string; subtitle: string} => {
  try {
    const stockRecord = stock.find(
      s => s.medication.identifier === medication.identifier,
    );

    if (stockRecord !== undefined) {
      if (isOutOfStock(stockRecord)) {
        return {
          status: 'unavailable',
          title: 'Out of stock',
          subtitle:
            'This medication is out of stock. You can still accept the medication request',
        };
      }

      if (isStockLow(stockRecord)) {
        return {
          status: 'available',
          title: 'Low in stock',
          subtitle:
            'Stock for this is low. Please order more or update information in the `Medication Stock` section.',
        };
      }

      // ...
      return {
        status: 'available',
        title: 'In Stock',
        subtitle:
          'Medication is available. You can safely accept the medication request',
      };
    } else {
      return {
        status: 'unavailable',
        title: 'No record of medication',
        subtitle:
          "We have no stock information of the medication that's requested",
      };
    }
  } catch (err) {
    return {
      status: 'unknown',
      title: 'Unknown',
      subtitle:
        'Currently unable to tell if should safely accept this medication request',
    };
  }
};

// key to access the workflow stock
const WF_STOCK_KEY = 'stock';

// checks the status of a medication
export function MedicationStatusComponent({
  medication,
}: {
  // medication to observe the status
  medication: ctc.ARVMedication;
}) {
  const [stockStatus, set] = React.useState(() =>
    checkStockStatus(medication, useWorkflowApi.getState().value[WF_STOCK_KEY]),
  );

  React.useEffect(() => {
    const unsub = useWorkflowApi.subscribe(sx => {
      set(checkStockStatus(medication, sx.value[WF_STOCK_KEY]));
    });

    return () => unsub();
  }, [set, medication]);

  return (
    <Section
      icon={
        stockStatus.status === 'unknown'
          ? 'help'
          : stockStatus.status === 'available'
          ? 'check'
          : 'close'
      }
      title={stockStatus.title}
      desc={stockStatus.subtitle}
      mode="raised"
      removeLine
    />
  );
}
