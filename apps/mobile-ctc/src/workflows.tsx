import React from 'react';

import create from 'zustand';
import createContext from 'zustand/context';
import produce from 'immer';

import {
  WorkflowScreenProps,
  FunctionListMap,
  StateMap,
} from '@elsa-ui/react-native-workflows';
import {NavigationProp, RouteProp} from '@react-navigation/native';

/** ------- */

// ideally, these should be moved to the @elsa-ui/react-native/workflows

// Defines what a screen would be
type WFScreen = React.FC<WorkflowScreenProps<any, any>>;

// Gets the properties of the screens
type ScreenProps<Screen extends WFScreen> = Parameters<Screen>[0];

// Get's the entry values of the screens
type ScreenEntry<Screen extends WFScreen> = ScreenProps<Screen>['entry'];

// Gets the actions associated with the screens
// type ScreenActions<Screen extends WFScreen> = ScreenProps<Screen>['actions'];

/**
 * Creates the proper parameters for a navigator to make it useful
 */
export type WorkflowNavigator<
  M extends {[screen: string]: WFScreen},
  SN extends keyof M = keyof M,
> = {
  [screen in SN]: ScreenEntry<M[screen]>;
};

/** ------- */

type KeyValue = {[d: string]: any};
type WorkflowStore<V extends KeyValue = KeyValue> = {
  value: V;
  setValue: (fn: ((v: V) => V) | V) => void;
};

// // Create a store
// const createStore = () =>
//   create<WorkflowStore>(set => ({
//     value: {
//       // setting the appointments
//       appointments: [1, 2],
//     },
//     setValue: (id, fn) =>
//       set(s =>
//         produce(s, df => {
//           df.value[id] = fn(s.value[id]);
//         }),
//       ),
//   }));

/**
 * Adds contextual information to the screen
 * attached to the flow
 * @param WfScreen
 * @param config
 * @returns
 */
export const withFlowContext =
  <T extends StateMap, A extends FunctionListMap>(
    WfScreen: (wfsp: WorkflowScreenProps<T, A>) => JSX.Element,
    config: {
      entry?: T;
      actions?: ({navigation}: {navigation: NavigationProp<any>}) => A;
    } = {},
  ) =>
  ({
    navigation,
    route,
  }: {
    navigation: NavigationProp<any>;
    route?: RouteProp<any>;
  }) => {
    const entryData = React.useMemo(
      () => ({...config.entry, ...(route?.params || {})}),
      [route?.params],
    );
    return (
      <WfScreen
        entry={(entryData ?? {}) as T}
        actions={config.actions?.({navigation}) ?? ({} as A)}
      />
    );
  };

// create context of the application
// const {Provider, useStore: useWorkflowStore} = createContext<WorkflowStore>();

export function buildWorkflowStore<KV extends KeyValue>(
  workflowInitialState: KV = {} as KV,
) {
  // create context of the application
  // const {Provider, useStore: useWorkflowStore} =
  //   createContext<WorkflowStore<KV>>();
  const {Provider, useStore: useWorkflowStore} =
    createContext<WorkflowStore<KV>>();

  // Create a store
  // const createStore = () =>
  const createWorkflowStore = (initialState: KV) => () =>
    create<WorkflowStore<KV>>(set => ({
      value: initialState,
      setValue: fn =>
        set(s =>
          produce(s, df => {
            if (typeof fn === 'function') {
              df.value = fn(s.value);
            } else {
              df.value = fn;
            }
          }),
        ),
    }));

  /**
   *
   * @param param0
   * @returns
   */
  const WorkflowProvider = ({
    initialState,
    children,
  }: {
    initialState?: KV;
    children: React.ReactNode;
  }) => (
    <Provider
      createStore={createWorkflowStore(
        Object.assign(workflowInitialState, initialState ?? ({} as KV)),
      )}>
      {children}
    </Provider>
  );

  return {WorkflowProvider, useWorkflowStore};
}
