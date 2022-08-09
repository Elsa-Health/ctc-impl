/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Toast, {
  ToastConfig,
  BaseToast,
  ToastShowParams,
} from 'react-native-toast-message';

import {DefaultTypography as typo} from '@elsa-ui/react-native/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {View} from 'react-native';

const toastConfiguration: ToastConfig = {
  info: ({...props}) => (
    <BaseToast
      {...props}
      text1Style={{
        fontWeight: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'bold', italic: false}),
        fontSize: 16,
        color: '#1a2447',
      }}
      text2Style={{
        fontStyle: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'normal', italic: false}),
        fontSize: 14,
        color: '#6a86c6',
      }}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 10,
          }}>
          <Icon name="information-outline" size={20} color="#6a86c6" />
        </View>
      )}
      style={{
        borderLeftWidth: 0,
        backgroundColor: '#fff',
        height: 'auto',
        elevation: 4,
        paddingVertical: 4,
      }}
      contentContainerStyle={{
        paddingHorizontal: 10,
        borderRightWidth: 0,
        paddingVertical: 4,
      }}
    />
  ),
  success: props => (
    <BaseToast
      {...props}
      text1Style={{
        fontWeight: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'bold', italic: false}),
        fontSize: 16,
        color: '#275724',
      }}
      text2Style={{
        fontStyle: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'normal', italic: false}),
        fontSize: 14,
        color: '#f3fbf2',
      }}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 10,
          }}>
          <Icon name="check" size={20} color="#275724" />
        </View>
      )}
      style={{
        borderLeftWidth: 0,
        backgroundColor: '#4bb543',
        height: 'auto',
        elevation: 4,
        paddingVertical: 4,
      }}
      contentContainerStyle={{
        paddingHorizontal: 10,
        borderRightWidth: 0,
        paddingVertical: 4,
      }}
    />
  ),
  warn: props => (
    <BaseToast
      {...props}
      text1Style={{
        fontWeight: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'bold', italic: false}),
        fontSize: 16,
        color: '#735610',
      }}
      text2Style={{
        fontStyle: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'normal', italic: false}),
        fontSize: 14,
        color: '#876a0c',
      }}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 10,
          }}>
          <Icon name="alert" size={20} color="#735610" />
        </View>
      )}
      style={{
        borderLeftWidth: 0,
        backgroundColor: '#d1bf00',
        height: 'auto',
        elevation: 4,
        paddingVertical: 4,
      }}
      contentContainerStyle={{
        paddingHorizontal: 10,
        borderRightWidth: 0,
        paddingVertical: 4,
      }}
    />
  ),
  error: props => (
    <BaseToast
      {...props}
      text1Style={{
        fontWeight: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'bold', italic: false}),
        fontSize: 16,
        color: '#fff',
      }}
      text2Style={{
        fontStyle: 'normal',
        fontFamily: typo.fontFamilyStyle({font: 'normal', italic: false}),
        fontSize: 14,
        color: '#ffa0a0',
      }}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 10,
          }}>
          <Icon name="close-circle" size={20} color="#fff" />
        </View>
      )}
      style={{
        borderLeftWidth: 0,
        backgroundColor: '#c11414',
        height: 'auto',
        elevation: 4,
        paddingVertical: 4,
      }}
      contentContainerStyle={{
        paddingHorizontal: 10,
        borderRightWidth: 0,
        paddingVertical: 4,
      }}
    />
  ),
};

export const ToastPortal = () => <Toast config={toastConfiguration} />;

type TShowParams = Omit<ToastShowParams, 'type'>;
const T = {
  showError: (props: TShowParams) => Toast.show({...props, type: 'error'}),
  showInfo: (props: TShowParams) => Toast.show({...props, type: 'info'}),
  showSuccess: (props: TShowParams) => Toast.show({...props, type: 'success'}),
  showWarn: (props: TShowParams) => Toast.show({...props, type: 'warn'}),
  show: Toast.show,
};

export {T as Toast};
