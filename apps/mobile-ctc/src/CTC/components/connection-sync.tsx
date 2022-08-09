/**
 * Syncronization of the application
 */
import React from 'react';
import {useWebSocket} from '../../app/utils';
import {fetchCRDTMessages, syncContentsFromSocket} from '../actions/socket';

import {onSnapshotUpdate} from '../emr-helpers/store';

import produce from 'immer';
import {useWorkflowStore} from '../workflow';
import {capitalize} from 'lodash';
import {TouchableRipple} from 'react-native-paper';
import {View} from 'react-native';
import {Text} from '@elsa-ui/react-native/components';

const ConnectionSync = React.memo(function ({provider, wsURL}: any) {
  // Get web socket
  const {socket, status, retry} = useWebSocket({
    url: wsURL,
    onOpen(socket) {
      // Connected
      if (socket.readyState === WebSocket.OPEN) {
        fetchCRDTMessages(provider).then(message => {
          if (message !== null) {
            // console.log(s);
            const s = JSON.stringify(message);
            socket.send(s);
          }
        });
      }
    },

    onData(data) {
      // console.log(`[${provider.facility.ctcCode ?? 'UNKNOWN'}]:`, data);
      // peform synchronization
      syncContentsFromSocket(data);
    },

    // fires when status changed
    onChangeStatus: status => {
      useWorkflowStore.setState(s =>
        produce(s, df => {
          df.value.networkStatus = status;
        }),
      );
    },
  });

  React.useEffect(() => {
    if (socket !== undefined && status === 'online') {
      // console.log('Socket readyState');
      const sub = onSnapshotUpdate(provider, msg => {
        socket.send(JSON.stringify(msg));
      });

      return () => sub.unsubscribe();
    }
  }, [socket, status, provider]);

  return <ConnectionStatus retry={retry} />;
});

export function ConnectionStatus({retry}: any) {
  const status = useWorkflowStore(s => s.value.networkStatus);

  const onPress = React.useCallback(() => {
    return status === 'error' || status === 'offline' ? retry() : undefined;
  }, [status, retry]);

  const color = React.useMemo(
    () => (status === 'online' || status === 'error' ? '#FFF' : '#000'),
    [status],
  );

  const backgroundColor = React.useMemo(
    () =>
      status === 'connecting'
        ? '#CCC'
        : status === 'offline'
        ? '#EEE'
        : status === 'online'
        ? '#4665af'
        : '#F00',
    [status],
  );

  const text = React.useMemo(
    () =>
      `${capitalize(status)}. ${
        status === 'error' || status === 'offline' ? 'Press to reconnect?' : ''
      }`,
    [status],
  );

  return (
    <TouchableRipple onPress={onPress}>
      <View
        style={{
          backgroundColor,
          paddingVertical: 2,
        }}>
        <Text
          size="sm"
          font="medium"
          style={{textAlign: 'center'}}
          color={color}>
          {text}
        </Text>
      </View>
    </TouchableRipple>
  );
}

export default ConnectionSync;
