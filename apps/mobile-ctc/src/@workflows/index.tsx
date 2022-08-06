import React from 'react';

// Workflow configuration
type InitialPropsType = {[field: string]: any};
type ActionList = {[fnName: string]: (...a: any[]) => any};

export type WorkflowScreenProps<
  InitialProps extends InitialPropsType,
  Actions extends ActionList = {},
> = {
  entry: InitialProps;
  actions: Actions;
};

// FIXME:
export const withFlowContext = <
  T extends InitialPropsType,
  A extends ActionList,
>(
  Component: React.FC<WorkflowScreenProps<T, A>>,
  k: {
    entry?: T;
    actions?: ({navigation}: any) => A;
  } = {},
) =>
  React.memo(function ({navigation, route}: any) {
    const entryData = React.useMemo(
      () => (({...k.entry, ...(route?.params || {})} || {}) as T),
      [route?.params],
    );

    const actions = React.useMemo(
      () => (k.actions?.({navigation}) || {}) as A,
      [navigation],
    );

    return <Component entry={entryData} actions={actions} />;
  });

// export { useStore as useWorkflowContext };
