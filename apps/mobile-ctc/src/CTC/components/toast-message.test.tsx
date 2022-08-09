import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import {Toast, ToastPortal} from './toast-message';

describe('<Toast />', () => {
  test('Renders correctly!', () => {
    // ...
    render(
      <>
        <ToastPortal />
      </>,
    );
  });
  test('Renders correctly!', () => {
    const P = () => {
      React.useEffect(() => {
        Toast.showError({text1: 'Title', text2: 'Subtitle'});
        Toast.showInfo({text1: 'Title', text2: 'Subtitle'});
        Toast.showSuccess({text1: 'Title', text2: 'Subtitle'});
        Toast.showWarn({text1: 'Title', text2: 'Subtitle'});
      }, []);
      return <View />;
    };

    // ...
    render(
      <>
        <P />
        <ToastPortal />
      </>,
    );
  });
});
