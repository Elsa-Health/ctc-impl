/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Portal,
  Modal,
  TouchableRipple,
  Searchbar,
  ActivityIndicator,
  Button,
  IconButton,
} from 'react-native-paper';

import {Text} from '@elsa-ui/react-native/components';
import {View, ViewProps} from 'react-native';
import create from 'zustand';
import {useAsyncRetry} from 'react-use';

import {FlashList} from '@shopify/flash-list';
import {query} from 'papai/collection';
import * as ctc from '@elsa-health/emr/lib/ctc/ctc.types';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {differenceInDays, differenceInHours, format} from 'date-fns';
import * as R from 'ramda';
import {date} from '@elsa-health/emr/lib/utils';
import {Row} from '../temp-components';
import {CollectionNode} from 'papai/collection/core';
import {formatDistanceToNow} from 'date-fns/esm';

export const useStockedMedication = create((set, get) => ({
  // only useful if item is used as a modal
  show: true,
  setShow: (show: boolean) => set(state => ({...state, show})),

  /**
   * Set the contents that selected on the list
   */
  selected: [],
  setSelected: (selected: any[] | ((d: any[]) => any[])) =>
    set(state => ({
      ...state,
      selected:
        typeof selected === 'function' ? selected(state.selected) : selected,
    })),

  /**
   * Set the contents that are to be disabled from press
   * NOTE: might want to add logic to disable if already selected
   */
  disabled: [],
  setDisabled: (disabled: any[] | ((d: any[]) => any[])) =>
    set(state => ({
      ...state,
      disabled:
        typeof disabled === 'function' ? disabled(state.disabled) : disabled,
    })),
}));

/**
 * Utilities
 * --------------------
 */

export const withStockItem = <T,>(fn: (item: ctc.ARVStockRecord) => T) => fn;

export const isStockLow = withStockItem(item => item.count < 10);
export const isOutOfStock = withStockItem(item => item.count === 0);

export const isAboutToExpire = withStockItem(item =>
  R.pipe(date, d => differenceInDays(d, new Date()) < 4)(item.expiresAt),
);
export const isExpired = withStockItem(item =>
  R.pipe(date, d => differenceInDays(d, new Date()) < 0)(item.expiresAt),
);

/*
 * Components
 * --------------------
 */

function CountStatus({item, style}: StatusProps) {
  if (isOutOfStock(item)) {
    return (
      <View
        style={[
          {
            borderRadius: 12,
            paddingHorizontal: 6,
            paddingVertical: 4,
            backgroundColor: '#EEE',
            borderColor: '#CCCCCC',
            borderWidth: 0.5,
          },
          style,
        ]}>
        <Text size="xs" color="#777">
          Out of stock - {item.count}
        </Text>
      </View>
    );
  }
  if (isStockLow(item)) {
    return (
      <View
        style={[
          {
            borderRadius: 12,
            paddingHorizontal: 6,
            paddingVertical: 4,
            backgroundColor: '#EEE',
            borderColor: '#CCCCCC',
            borderWidth: 0.5,
          },
          style,
        ]}>
        <Text size="xs" color="#777">
          Low Stock - {item.count}
        </Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Text size="xs" color="#777">
        In stock
      </Text>
    </View>
  );
}

type StatusProps = {style?: ViewProps['style']; item: ctc.ARVStockRecord};
function ExpiredStatus({item, style}: StatusProps) {
  if (isExpired(item)) {
    return (
      <View
        style={[
          {
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: '#eb403433',
            borderColor: '#73561044',
            borderWidth: 0.5,
          },
          style,
        ]}>
        <Text size="xs" color="#eb4034">
          Expired - {format(date(item.expiresAt), 'MMM d')}
        </Text>
      </View>
    );
  }
  if (isAboutToExpire(item)) {
    return (
      <View
        style={[
          {
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: '#efed0344',
            borderColor: '#73561044',
            borderWidth: 0.5,
          },
          style,
        ]}>
        <Text size="xs" color="#735610">
          Expires in {formatDistanceToNow(date(item.expiresAt))}
        </Text>
      </View>
    );
  }
  return null;
}

function Middot() {
  return (
    <View style={{marginHorizontal: 4}}>
      <Text font="bold" size={24}>
        ·
      </Text>
    </View>
  );
}
/**
 * Individual Medical Item component
 * @returns
 */
function MedItem({
  item,
  onPress,
  checker,
}: {
  item: ctc.ARVStockRecord;
  onPress: () => void;
  checker: (item: any, selected: any[]) => boolean;
}) {
  const [checked, setChecked] = React.useState(
    // initial check
    checker(item, useStockedMedication.getState().selected),
  );

  React.useEffect(() => {
    const d = useStockedMedication.subscribe(s => {
      setChecked(checker(item, s.selected));
    });

    return () => d();
  }, [item, checker]);

  return (
    <TouchableRipple rippleColor="#4665af55" onPress={onPress}>
      <View
        style={{
          width: '100%',
          minHeight: 40,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderTopWidth: 1,
          backgroundColor: checked ? '#4665af33' : undefined,
          borderTopColor: '#ddd',
        }}>
        <Row contentStyle={{justifyContent: 'flex-start'}} spaceBottom>
          <Text style={{marginRight: 4}}>{item.medication.text}</Text>
        </Row>
        <Row contentStyle={{justifyContent: 'flex-start'}} spaceBottom>
          <Text font="bold">{item.extendedData.group}</Text>
          <Middot />
          <Text font="bold">{item.medication.form}</Text>
        </Row>
        <Row contentStyle={{justifyContent: 'flex-start'}}>
          <CountStatus item={item} style={{marginRight: 6}} />
          <ExpiredStatus item={item} />
        </Row>
      </View>
    </TouchableRipple>
  );
}

type SMedListProps = {
  stockCollectionNode: CollectionNode<ctc.ARVStockRecord>;
  onDismiss?: () => void;
  onPressItem: (item: ctc.ARVStockRecord) => void;
  itemSelectionRule: (item: ctc.ARVStockRecord, selected: any[]) => boolean;
};
function SMedsList({
  stockCollectionNode: collection,
  onDismiss,
  onPressItem,
  itemSelectionRule,
}: SMedListProps) {
  const {
    retry,
    loading,
    error,
    value: items,
  } = useAsyncRetry(async () => {
    const vals = await query(collection);
    return vals.toArray();
  }, [collection]);

  React.useEffect(() => {
    const sub = collection.observable.subscribe(_ => {
      retry();
      // ...
    });

    return () => sub.unsubscribe();
  }, [collection, retry]);

  //   const [searchText, setSearchText] = React.useState('');
  const selectItem = React.useCallback(
    item => {
      if (onPressItem) {
        return () => onPressItem(item);
      }
    },
    [onPressItem],
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <ActivityIndicator animating />
        <Text>Loading Medications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          paddingHorizontal: 24,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Icon name="close-octagon" size={38} color="#c11414" />
        <Text color="#c11414" italic style={{textAlign: 'center'}}>
          Something went wrong. Unable to load the needed information
        </Text>
        <Row wrapperStyle={{marginVertical: 4}}>
          <Button icon="refresh" onPress={retry}>
            Try Again
          </Button>
          <Button icon="close" onPress={onDismiss}>
            Close
          </Button>
        </Row>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <View>
        <View style={{padding: 24}}>
          <Text font="bold">Select Medication</Text>
          <Text font="medium">Make selection on the medication items</Text>
        </View>
      </View>
      {/* Search */}
      {/* <View style={{paddingHorizontal: 16, paddingBottom: 12}}>
        <Searchbar
          placeholder="Filter by name"
          value={searchText}
          onChangeText={setSearchText}
          style={{elevation: 2}}
        />
      </View> */}
      <View style={{flex: 1}}>
        <FlashList
          data={items}
          renderItem={({item}) => (
            <MedItem
              item={item}
              onPress={selectItem(item)}
              checker={itemSelectionRule}
            />
          )}
          estimatedItemSize={10}
        />
      </View>
    </View>
  );
}
/**
 * Likely a highly reused component that has the list of
 * stocked medication that are to be adminsted to the patient
 * @param param0
 * @returns
 */
export function StockedMedicationList({
  show,
  dismiss,
  ...props
}: {show: boolean; dismiss: () => void} & Omit<SMedListProps, 'dismiss'>) {
  // to use the stock inforamtion to render the contents
  // things needed to highlight
  // 1. medication (ARV)
  // 2. available
  // 3. expire warning
  // 4. low stock (using preset threshold)
  // 5. disable when out of stock
  return (
    <React.Fragment>
      <Portal>
        <Modal
          visible={show}
          onDismiss={dismiss}
          contentContainerStyle={{
            backgroundColor: '#fff',
            margin: 16,
            flex: 1,
            borderRadius: 4,
          }}>
          <View>
            <IconButton icon="close" onPress={dismiss} />
          </View>
          <SMedsList {...props} onDismiss={dismiss} />
        </Modal>
      </Portal>
    </React.Fragment>
  );
}
