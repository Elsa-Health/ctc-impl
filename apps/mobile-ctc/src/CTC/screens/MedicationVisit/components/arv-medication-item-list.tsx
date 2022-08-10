import {ctc} from '@elsa-health/emr';
import produce from 'immer';
import {CollectionNode} from 'papai/collection/core';
import React from 'react';
import {View} from 'react-native';
import {Chip} from 'react-native-paper';
import {
  StockedMedicationList,
  useStockedMedication,
} from '../../../components/stocked-medication-list';
import {Row} from '../../../temp-components';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ARVMedicationItemList = React.memo(
  ({
    show,
    dismiss,
    collection,
    selected = [],
    onSelectedItems,
  }: {
    show: boolean;
    dismiss: () => void;
    // selected: any[];
    onSelectedItems: (items: any[]) => void;
    collection: () => CollectionNode<any>;
  }) => {
    // const [selected, select] = React.useState<ARVStockRecord[]>([])
    const alreadySelected = useStockedMedication(s => s.selected);
    // const select = useStockedMedication(
    //   React.useCallback(s => s.setSelected, []),
    // );
    const select = useStockedMedication.getState().setSelected;

    console.log('###');
    React.useEffect(() => {
      console.log('XYZ');
      useStockedMedication.getState().setSelected(selected);
    }, []);

    // React.useEffect(() => {
    //   console.log({onSelectedItems});
    // }, [onSelectedItems]);
    React.useEffect(() => {
      const sub = useStockedMedication.subscribe(s => {
        // console.log('$$$', s);
        onSelectedItems(s.selected.map(x => x.medication));
      });

      return () => sub();
    }, [onSelectedItems]);

    const pressItem = React.useCallback(
      item =>
        select(x =>
          produce(x, df => {
            const idx = df
              .map(s => s.medication.identifier)
              .findIndex(sd => sd === item.medication.identifier);
            if (idx > -1) {
              // remove
              df.splice(idx, 1);
            } else {
              // add
              df.push(item);
            }
          }),
        ),
      [select],
    );

    const checkRule = React.useCallback(
      (item, sx) =>
        sx
          .map(s => s.medication.identifier)
          .includes(item.medication.identifier),
      [],
    );

    const renderItem = React.useCallback(
      (item: ctc.ARVStockRecord, ix) => (
        <Chip
          closeIcon={() => <Icon name="close" size={16} />}
          style={{marginRight: 6, marginBottom: 6, height: 38}}
          onPress={() => pressItem(item)}
          onClose={() => pressItem(item)}
          key={ix}>
          {item.medication.text}
        </Chip>
      ),
      [],
    );
    // const [selected, selectedItem] = Reac
    return (
      <View
        style={{
          height: 'auto',
          flex: 1,
        }}>
        <StockedMedicationList
          stockCollectionNode={collection()}
          show={show}
          dismiss={dismiss}
          // see
          itemSelectionRule={checkRule}
          onPressItem={pressItem}
        />
        <Row
          spaceTop
          contentStyle={{
            justifyContent: 'flex-start',
            flex: 1,
            flexWrap: 'wrap',
            height: 'auto',
          }}>
          {alreadySelected.map(renderItem)}
        </Row>
      </View>
    );
  },
);

export default ARVMedicationItemList;
