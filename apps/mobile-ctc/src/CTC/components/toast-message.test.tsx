import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import {Toast, toastConfiguration, ToastPortal} from './toast-message';

describe('<Toast />', () => {
  test('Renders correctly!', () => {
    // ...
    render(
      <>
        <ToastPortal />
      </>,
    );
  });
  test('render properly using toastConfiguration / info!', () => {
    render(
      <>
        {toastConfiguration.info({
          text1: 'Title',
          text2: 'Subtitle',
          position: 'bottom',
        })}
      </>,
    );
  });
  test('render properly using toastConfiguration / success!', () => {
    render(
      <>
        {toastConfiguration.success({
          text1: 'Title',
          text2: 'Subtitle',
          position: 'bottom',
        })}
      </>,
    );
  });
  test('render properly using toastConfiguration / warn!', () => {
    render(
      <>
        {toastConfiguration.warn({
          text1: 'Title',
          text2: 'Subtitle',
          position: 'bottom',
        })}
      </>,
    );
  });
  test('render properly using toastConfiguration / error!', () => {
    render(
      <>
        {toastConfiguration.error({
          text1: 'Title',
          text2: 'Subtitle',
          position: 'bottom',
        })}
      </>,
    );
  });
  test('Renders correctly using React API!', () => {
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
