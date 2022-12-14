import React from 'react';
import SplashScreen from 'react-native-splash-screen';
// import {
//   ApplicationProvider,
//   AppLoginState,
//   useApplication,
// } from './app/context/application';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '@elsa-ui/react-native/theme';

import {LanguageProvider} from '@elsa-ui/react-native-workflows/utilities/locale';

import {
  ApplicationProvider,
  authenticate,
  useApplication,
} from './provider/context';

import CTC from './CTC';
import {NavigationContainer} from '@react-navigation/native';
import produce from 'immer';

import QRLogin from './CTC/screens/QRAuthentication';
import * as Sentry from '@sentry/react-native';

import {Text} from '@elsa-ui/react-native/components';
import {ToastAndroid, View} from 'react-native';
import {Analytics} from './CTC/analytics';

import pj from '../package.json';

import codePush from 'react-native-code-push';
import {useAsync} from 'react-use';
import {ProgressBar} from 'react-native-paper';

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

// FIXME: Remove API key and secret
// if (!__DEV__) {
// if (true) {
Sentry.init({
  dsn: 'https://6ca7254d249c4739b3db2cb7af62b796@o683972.ingest.sentry.io/5804165',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  // tracesSampleRate: 1.0,
  tracesSampleRate: 0.5,
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      // ...
    }),
  ],
});
// }

// import firestore from '@react-native-firebase/firestore';
// (async () => {
//   const f = firestore().collection('facilities');
//   const s = await f.get();

//   const out = s.docs
//     .map(d => d.data())
//     .filter(d => d.ctcCode !== undefined)
//     .map(d => ({name: d.name, ctc: d.ctcCode}));
//   console.log(out);
// })();

function _Application() {
  // set's the user if passed... otherwise.. doesnt
  // TODO: Set up such that the types match with the workflow -> UserObject
  // const setUser = useApplication(s => s.login);
  // const {provider, set} = useApplication();

  const {loading, state, logout, set} = useApplication();
  // Create a ref for the navigation container
  const navigation = React.useRef();
  React.useEffect(() => {
    SplashScreen.hide();
  }, []);

  React.useEffect(() => {
    if (state) {
      //
      Analytics.init(state.provider);
    }
  }, [state]);

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (state !== null) {
    return (
      <NavigationContainer
        ref={navigation}
        onReady={() => {
          // Register the navigation container with the instrumentation
          routingInstrumentation.registerNavigationContainer(navigation);
        }}>
        <CTC
          appVersion={pj.version}
          provider={state.provider}
          logout={async () => {
            logout();
            await Analytics.logEvent('logout');
          }}
        />
      </NavigationContainer>
    );
  }

  return (
    <QRLogin
      actions={{
        authenticate: authenticate,
        onQueryProvider: async provider => {
          try {
            set({provider, settings: null});
            await Analytics.logEvent('login');
          } catch (err) {
            ToastAndroid.show(
              'Log In failed. Please report this or try again later.',
              ToastAndroid.SHORT,
            );
            Sentry.captureException(err);
          }
        },
      }}
    />
  );
}

function CodePushWrapper({children}: {children: React.ReactNode}) {
  const [text, set] = React.useState(`Version: ${pj.version}`);
  const [progress, setProgress] = React.useState(0);

  const statusCb = (status: codePush.SyncStatus) => {
    setProgress(0);
    switch (status) {
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        // Show "downloading" modal
        set('Downloading update');
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        // Hide "downloading" modal
        set('Installing update');
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        set('Update Installed!');
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        set(`Version: ${pj.version} (Latest)`);
        break;
    }
  };
  // Makes the update happen
  useAsync(async () => {
    const out = await codePush.sync(
      {
        updateDialog: {
          mandatoryUpdateMessage:
            "There's a new update you must have. Please continue to install.",
          optionalUpdateMessage:
            'New update! You can choose install it now or later.',
          mandatoryContinueButtonLabel: 'Continue',
          optionalIgnoreButtonLabel: 'Install Later',
          optionalInstallButtonLabel: 'Install Now',
        },
        installMode: codePush.InstallMode.IMMEDIATE,
      },
      statusCb,
      ({receivedBytes, totalBytes}) => {
        /* Update download modal progress */
        setProgress(receivedBytes / totalBytes);
      },
    );

    // run cb again
    statusCb(out);
  }, []);

  return (
    <>
      {children}
      {progress > 0 && <ProgressBar progress={progress} color={'#06a142'} />}
      <View style={{paddingVertical: 2, backgroundColor: '#4665af'}}>
        <Text style={{textAlign: 'center'}} color="#FFF" size={14}>
          {__DEV__ ? '[dev]' : ''} {text ?? 'N/A'}
        </Text>
      </View>
    </>
  );
}

export function App() {
  return (
    <ThemeProvider
      theme={theme =>
        produce(theme, df => {
          df.contentType = 'colored';
        })
      }>
      <ApplicationProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <CodePushWrapper>
              <_Application />
            </CodePushWrapper>
          </SafeAreaProvider>
        </LanguageProvider>
      </ApplicationProvider>
    </ThemeProvider>
  );
}

// export default __DEV__ ? App : Sentry.wrap(App);
export default Sentry.wrap(App);
