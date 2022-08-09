import React from 'react';

import {WorkflowScreenProps} from '@elsa-ui/react-native-workflows';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {render} from '@testing-library/react-native';

import {withFlowContext} from './workflows';

const Stack = createNativeStackNavigator();

function PageA({
  entry: _,
  actions: _$,
}: WorkflowScreenProps<{value: number}, {onNext: () => void}>) {
  return <></>;
}

function PageB({
  entry: _,
  actions: _$,
}: WorkflowScreenProps<{value: number}, {onBack: () => void}>) {
  return <></>;
}

describe('withFlowContext', () => {
  test('Works correctly', () => {
    // ...
    render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="page-a"
            component={withFlowContext(PageA, {
              entry: {
                value: 34,
              },
              actions: ({navigation}) => ({
                onNext() {},
              }),
            })}
          />
          <Stack.Screen
            name="page-b"
            component={withFlowContext(PageB, {
              entry: {
                value: 300,
              },
              actions: ({navigation}) => ({
                onBack() {},
              }),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>,
    );
  });
});
