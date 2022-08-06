import React from 'react';
import {View, Text} from 'react-native';
import RNRestart from 'react-native-restart';

import * as Sentry from '@sentry/react-native';
import {Button} from 'react-native-paper';
import {ElsaColorableIcon} from '@elsa-ui/react-native/visuals/vectors';

export function ErrorFallback({
  error,
  componentStack,
  resetErrorBoundary,
}: any) {
  React.useEffect(() => {
    Sentry.captureEvent(error);
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
      <View
        style={{
          marginBottom: 10,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
        <ElsaColorableIcon color={'#4665af'} width={34} height={34} />
        <Text style={{paddingTop: 8}}>
          Something went wrong. Please try again!
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={() => {
          console.log('Restarting');
          RNRestart.Restart();
        }}>
        Try again!
      </Button>
    </View>
  );
}
