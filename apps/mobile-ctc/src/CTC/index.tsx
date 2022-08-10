import React from 'react';

import DashboardScreen from './screens/Dashboard';
import PatientDashboard from './screens/PatientDashboard';
import MedicationsDashboardScreen from './screens/MedicationDashboard';
import ReportSummaryScreen from './screens/ReportSummary';

import ViewAppointmentsScreen from './screens/ViewAppointments';
import ViewVisitScreen from './screens/ViewVisit';
import ViewPatientScreen from './screens/ViewPatient';
import ViewInvestigationScreen from './screens/ViewInvestigation';

import MedicationMapScreen from './screens/MedicationMap';
import RegisterNewPatientScreen from './screens/RegisterNewPatient';
import ReportMissedAppointmentScreen from './screens/ReportMissedAppointment';

import MedicationDispenseScreen from './screens/MedicationDispense';
import MedicationRequestScreen from './screens/MedicationRequest';
import EditPatientScreen from './screens/EditPatient';

// import {withFlowContext} from '@elsa-ui/react-native-workflows';
import uuid from 'react-native-uuid';

import {ElsaProvider} from '../provider/backend';
import {ARV, Investigation} from 'elsa-health-data-fns/lib';

// TODO: change implementation of this
import {withFlowContext} from '@elsa-ui/react-native-workflows';
// import {withFlowContext} from '../@workflows';

import {doc, setDoc, getDocs, query, updateDoc} from 'papai/collection';
import {List} from 'immutable';
import {ToastAndroid} from 'react-native';
import _ from 'lodash';

import {queryPatientsFromSearch} from './actions/ui';
import {referred as reference, type ctc as CTC} from '@elsa-health/emr';
import MedicationVisit from './screens/MedicationVisit';
import MedicationStock from './screens/MedicationStock';
import {
  useListenCollection,
  useAttachAppointmentsListener,
} from './emr-helpers/react-hooks';

import * as Sentry from '@sentry/react-native';
import {convertDMYToDate, removeWhiteSpace} from './emr-helpers/utils';
import {format, isAfter} from 'date-fns';
import {getEMR, Seeding} from './emr-helpers/store';
import {
  AppointmentRequest,
  Ingredient,
  Medication,
  Patient,
  Report,
  Stock,
  ctc,
  prepareLazyExecutors,
  executeChain,
  InvestigationResult,
  Observation,
  MedicationDispense,
} from '@elsa-health/emr';
import {date, utcDateString} from '@elsa-health/emr/lib/utils';

// Migration code

import SplashScreen from 'react-native-splash-screen';
import {Stack, useWorkflowStore, WorkflowProvider} from './workflow';
import produce from 'immer';
import {SafeAreaView} from 'react-native-safe-area-context';
import ConnectionSync from './components/connection-sync';
import {Toast, ToastPortal} from './components/toast-message';

export function getOrganizationFromProvider(
  ep: ElsaProvider,
): ctc.Organization {
  const {name, phoneNumber, address, ctcCode, website} = ep.facility;

  return {
    id: name + (ctcCode ?? ''),
    active: true,
    associatedOrganization: null,
    code: null,
    // Get this information
    createdAt: new Date().toUTCString(),
    email: null,
    identifier:
      ctcCode === undefined
        ? null
        : {
            ctcCode,
          },
    name,
    resourceType: 'Organization',
    phoneNumber,
    extendedData: {
      geo: null,
      address: address ?? null,
      website: website ?? null,
    },
  };
}

function practitioner(ep: ElsaProvider): CTC.Doctor {
  return {
    active: true,
    address: ep.facility.address ?? null,
    birthDate: null,
    code: null,
    communication: {language: 'en'},
    contact: {
      email: ep.user.email ?? null,
      phoneNumber: ep.user.phoneNumber ?? null,
    },
    createdAt: new Date().toISOString(),
    gender: 'unknown',
    id: ep.user.uid,
    name: ep.user.displayName ?? ep.user.uid,
    organization: {
      resourceType: 'Reference',
      resourceReferenced: 'Organization',
      // id: ep.facility.name,
      data: {
        name: ep.facility.name,
        ctcCode: ep.facility.ctcCode ?? null,
      },
    },
    resourceType: 'Practitioner',
    serviceProvider: {
      active: true,
      code: null,
      createdAt: new Date().toISOString(),
      extendedData: {role: 'doctor', tag: 'ctc'},
      id: `ctc-doctor-${ep.user.uid} `,
      name: 'CTC Doctor',
      resourceType: 'HealthcareService',
    },
  };
}

export default function Main(props: any) {
  return (
    <WorkflowProvider>
      <App {...props} />
      <ToastPortal />
    </WorkflowProvider>
  );
}

let render = 0;

function App({
  provider,
  appVersion,
  logout,
}: {
  provider: ElsaProvider;
  appVersion: string;
  logout: () => Promise<void>;
}) {
  /**
   * Useful EMR components
   */

  // Create provider
  const [Emr, organization, doctor] = React.useMemo(
    () => [
      getEMR(provider),
      getOrganizationFromProvider(provider),
      practitioner(provider),
    ],
    [provider],
  );

  /**
   * Preparing storage executors
   */
  const executor = React.useMemo(
    () => ({
      visit: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('visits'),
      ),
      apptRequest: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('appointment-requests'),
      ),
      apptResponse: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('appointment-responses'),
      ),
      medicationRequest: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('medication-requests'),
      ),
      medicationDispense: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('medication-dispenses'),
      ),
      stock: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('stock'),
      ),
      patient: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('patients'),
      ),
      investigationRequest: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('investigation-requests'),
      ),
      investigationResult: prepareLazyExecutors(
        data => (data?.id ?? uuid.v4()) as string,
        Emr.collection('investigation-results'),
      ),
    }),
    [Emr],
  );

  React.useEffect(() => {
    // query(Emr.collection('visits'))
    //   .then(d => d.map(x => x.associatedAppointmentResponse))
    //   .then(console.log);

    if (organization) {
      // Perform seeding for those new accounts
      Seeding(Emr, organization);
    } else {
      console.error("You don't have an organization");
    }
  }, [organization, Emr]);

  React.useEffect(() => {
    SplashScreen.hide();
  }, []);

  // This should be 1
  console.log(++render);

  // setting values
  // const set = useWorkflowStore(s => R.pipe(s.setValue));

  // setting up the values on the pages
  React.useEffect(() => {
    // console.log('SHOUT');
    useWorkflowStore.getState().setValue(s =>
      produce(s, df => {
        df.provider = provider.toJSON();
        df.appVersion = appVersion;
      }),
    );
  }, [provider, appVersion]);

  // ---------------------------
  // STORE LISTENERS
  // ---------------------------

  // // attach store listeners and write them to a public place
  useListenCollection('visits', Emr.collection('visits'));
  useListenCollection('patients', Emr.collection('patients'));
  useListenCollection('publicStock', Emr.collection('publicStock'));
  useListenCollection('inv.reqs', Emr.collection('investigation-requests'));
  useListenCollection('inv.results', Emr.collection('investigation-results'));
  useListenCollection('stock', Emr.collection('stock'));

  useListenCollection('med.requests', Emr.collection('medication-requests'));
  useListenCollection('med.dispenses', Emr.collection('medication-dispenses'));

  // Appointment related stores
  useListenCollection(
    'appointment-requests',
    Emr.collection('appointment-requests'),
  );
  useListenCollection(
    'appointment-responses',
    Emr.collection('appointment-responses'),
  );
  // listens from changes of the 2 above
  useAttachAppointmentsListener();

  // const stock = useStock(Emr);
  // const report = useEMRReport(Emr);

  // Toast.show({
  //   type: 'info',
  //   text1: 'Base Information',
  //   text2: 'Something is happening',
  //   visibilityTime: 500000,
  // });

  return (
    <SafeAreaView style={{flex: 1}}>
      <ConnectionSync
        wsURL={`wss://${
          __DEV__ ? 'f7ca-197-250-61-138.eu.ngrok.io' : 'bounce-edge.fly.dev'
        }/ws/crdt/state`}
        provider={provider}
      />
      <Stack.Navigator
        initialRouteName="ctc.dashboard"
        screenOptions={{
          headerShown: false,
          presentation: 'formSheet',
          animation: 'slide_from_right',
          animationTypeForReplace: 'pop',
        }}>
        <Stack.Screen
          name="ctc.dashboard"
          component={withFlowContext(DashboardScreen, {
            entry: {
              fullName: provider.user.displayName ?? 'Daktari',
            },
            actions: ({navigation}) => ({
              logout,
              onSearchPatient() {
                navigation.navigate('ctc.patient-dashboard', {searchText: ''});
              },
              onNewPatient() {
                navigation.navigate('ctc.register-new-patient');
              },
              onViewPatients() {
                navigation.navigate('ctc.patient-dashboard');
              },
              onViewMedicationStock() {
                navigation.navigate('ctc.medication-stock');
              },
              onViewAppointments() {
                navigation.navigate('ctc.view-appointments');
              },
              onViewMedications() {
                navigation.navigate('ctc.medications-dashboard');
              },
              onReportMissedAppointment() {
                navigation.navigate('ctc.report-missed-appointments');
              },
              onViewReports() {
                navigation.navigate('ctc.report-summary');
              },
              onSeeOtherMedications() {
                navigation.navigate('ctc.medication-map');
              },
            }),
          })}
        />
        {/* <Stack.Screen 
          name="ctc.notifications"
          component={withFlowContext(NotificationsScreen, {})
        /> */}
        <Stack.Screen
          name="ctc.edit-patient"
          component={withFlowContext(EditPatientScreen<ctc.Patient>, {
            // entry: {
            // default
            // TODO: might want to remove this and only make visible for
            //  the pages that navigate to this page
            // patient: {},
            // },
            actions: ({navigation}) => ({
              onSavePatientEdit(id, edittedRecord, ref) {
                const patient = {patientId: id, ...edittedRecord};

                // execute the thing and change stuff
                // ...
                const updatedPatient = ctc.createPatientObject(
                  patient,
                  date(ref.createdAt),
                  // NOTE: when different organization modifies the records,
                  //  you might want to include that fact somewhere
                  ref.managingOrganization ?? organization,
                );

                const run = executor.patient(({update}) =>
                  update(id, updatedPatient),
                );

                run()
                  .then(() => console.log('Record updated'))
                  .catch(err =>
                    console.error('Record update failed' + err.message),
                  )
                  .catch(err => Sentry.captureException(err))
                  .finally(() => navigation.navigate('ctc.patient-dashboard'));

                // console.log({updatedPatient});
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.view-investigation"
          component={withFlowContext(
            ViewInvestigationScreen<ctc.InvestigationRequest>,
            {
              actions: ({navigation}) => ({
                async fetchInvestigationResults(
                  investigationId,
                  authorizingRequest,
                ) {
                  const invRes = await query<ctc.InvestigationResult>(
                    Emr.collection('investigation-results'),
                    {
                      where: item =>
                        item.authorizingRequest.id === investigationId,
                    },
                  );

                  return invRes.toArray().map(f => {
                    const lastUpdatedAt = date(f.lastUpdatedAt);
                    const createdAt = date(f.createdAt);

                    return {
                      id: f.id,
                      identifier: authorizingRequest.data.investigationId,
                      shape: authorizingRequest.data.obj,
                      value: f.observation.data,
                      lastUpdatedAt:
                        lastUpdatedAt.toISOString() === createdAt.toISOString()
                          ? null
                          : lastUpdatedAt,
                      createdAt: date(f.createdAt),
                    };
                  });
                },
                async saveResult(results, authorizingRequest) {
                  let invResult: ctc.InvestigationResult | null = null;
                  // console.log('===>', results);
                  // save the investigation result
                  if (results.id) {
                    // console.log('UPDATED!!');
                    // editing existing one
                    // TODO: Change this to a todo script instead
                    invResult = InvestigationResult<ctc.InvestigationResult>({
                      id: results.id,
                      authorizingRequest,
                      createdAt: utcDateString(results.createdAt),
                      observation: Observation({
                        data: results.value,
                        reason: 'Updated!',
                      }),
                      shape: authorizingRequest.data.obj,
                      lastUpdatedAt: utcDateString(),
                    });
                  } else {
                    invResult = InvestigationResult<ctc.InvestigationResult>({
                      id: `inv-res:${uuid.v4()}`,
                      authorizingRequest,
                      observation: Observation({
                        data: results.value,
                        reason: 'Created',
                      }),
                      shape: authorizingRequest.data.obj,
                      lastUpdatedAt: utcDateString(),
                    });
                  }

                  console.log({results, authorizingRequest});
                  if (invResult === null) {
                    // ToastAndroid.show(
                    //   'Unable to create the investigation results!',
                    //   ToastAndroid.LONG,
                    // );
                    Toast.showInfo({
                      text1: 'Failed',
                      text2: "Couldn't create a result for the investigation ",
                    });

                    return;
                  }

                  // save the investigation result
                  executeChain([
                    executor.investigationResult(({add}) =>
                      add(invResult as ctc.InvestigationResult),
                    ),
                    () => {
                      Toast.showInfo({
                        text1: 'Result created!',
                        text2: `Created the investigation result for ${authorizingRequest.data.investigationId}`,
                      });
                      // ToastAndroid.show(
                      //   'Investigation Result Updated!',
                      //   ToastAndroid.LONG,
                      // )
                    },
                    // () => console.log('Done!'),
                    // navigation.goBack,
                  ]);
                },
              }),
            },
          )}
        />
        <Stack.Screen
          name="ctc.report-missed-appointments"
          component={withFlowContext(ReportMissedAppointmentScreen, {
            entry: {
              myCtcId: provider.facility.ctcCode,
            },
            actions: ({navigation}) => ({
              async checkIfPatientExists(patientId) {
                const s = await query(Emr.collection('patients'), {
                  where: item => item.id === patientId,
                });

                return s.count() > 0;
              },
              async onSubmitReport({
                patientId,
                appointmentDate,
                missedDate,
                sex,
                dateOfBirth,
              }) {
                // get patient
                const patients = await query(Emr.collection('patients'), {
                  where: item => item.id === patientId,
                });

                // console.log('-> something!!');
                let patient;

                if (patients.count() > 0) {
                  // patient exists
                  patient = patients.get(0);
                } else {
                  // patient doesnt exist,
                  if (sex === undefined || dateOfBirth === undefined) {
                    Toast.showError({
                      text1: 'Missing necessary details',
                      text2:
                        'Please check the form. You are likely missing sex or birthDate',
                    });
                    // ToastAndroid.show(
                    //   'Missing necessary info for patient registration',
                    //   ToastAndroid.LONG,
                    // );
                    return;
                  }

                  // quickly create new patient

                  const newPatient = Patient<CTC.Patient>({
                    id: patientId,
                    sex: sex,
                    birthDate: dateOfBirth,
                  });
                  await setDoc(
                    doc(Emr.collection('patients'), patientId),
                    newPatient,
                  );
                  patient = newPatient;
                }

                // console.log({patient});

                if (patient === undefined) {
                  ToastAndroid.show(
                    'Patient information missing, Try again later',
                    ToastAndroid.LONG,
                  );

                  Toast.showError({
                    text1: 'Missing details',
                    text2: 'Patient information missing, Try again later',
                  });
                  return;
                }

                const reportId = uuid.v4() as string;
                // ...
                // create report
                await setDoc(
                  doc(Emr.collection('reports'), reportId),
                  Report<CTC.Report.MissedAppointment>({
                    id: reportId,
                    reportCode: 'missed',
                    code: 'appointment-report',
                    subject: reference(patient),
                    reporter: reference(doctor),
                    result: {
                      missedDate: convertDMYToDate(missedDate).toUTCString(),
                      reason: null,
                    },
                  }),
                );
                // console.log('Creating appointment request...');

                // create appointment
                const appointmentId = uuid.v4() as string;
                await setDoc(
                  doc(Emr.collection('appointment-requests'), appointmentId),
                  AppointmentRequest<CTC.AppointmentRequest>({
                    appointmentDate:
                      convertDMYToDate(appointmentDate).toUTCString(),
                    id: appointmentId,
                    participants: [reference(patient), reference(doctor)],
                    reason: 'Previously missed appointment',
                  }),
                );

                console.log('Creating Done...');

                Toast.showSuccess({
                  text1: 'Completed!',
                  text2: 'Successfully created a missed appointment request',
                });
                // ToastAndroid.show(
                //   'Completed creating missed appointment request',
                //   ToastAndroid.LONG,
                // );
                navigation.goBack();
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.view-appointments"
          component={withFlowContext(ViewAppointmentsScreen)}
        />
        <Stack.Screen
          name="ctc.medication-map"
          component={withFlowContext(MedicationMapScreen, {
            entry: {
              organization,
            },
            actions: ({navigation}) => ({
              async fetchPublicStock() {
                const d = await query(Emr.collection('publicStock'));
                return d;
              },
              onGoToUpdateStock() {
                navigation.navigate('ctc.medication-stock');
              },
            }),
          })}
        />
        {/* 
        <Stack.Screen
          name="ctc.medication-stock-dashboard"
          component={withFlowContext(MedicationStockDashboardScreen, {
            actions: ({navigation}) => ({
              onGoToManageStock() {
                navigation.navigate('ctc.medication-stock');
              },
              onSeeOtherMedications() {
                navigation.navigate('ctc.medication-map');
              },
              // onGoToQuickIndications() {
              //   navigation.navigate('ctc.medication-stock-simple');
              // },
            }),
          })}
        /> */}
        <Stack.Screen
          name="ctc.report-summary"
          component={withFlowContext(ReportSummaryScreen)}
        />
        <Stack.Screen
          name="ctc.medication-visit"
          component={withFlowContext(
            MedicationVisit<CTC.Patient, CTC.Visit, CTC.Organization>,
            {
              actions: ({navigation}) => ({
                getStockCollectionNode: () => Emr.collection('stock'),
                async fetchAppointments(patientId: string) {
                  const appts = appointments.appointments
                    .filter(d => d.type === 'not-responded')
                    .filter(
                      d =>
                        d.participants
                          .filter(
                            x =>
                              x.resourceType === 'Reference' &&
                              x.resourceReferenced === 'Patient',
                          )
                          .findIndex(x => x.id === patientId) > -1,
                    );

                  return appts;
                },
                async complete(data, patient, organization, refVisit) {
                  // console.log(data.arvRegimens.map(d => d.medication));

                  // Dealing with dispensing ARV Medication.

                  // substract the stock information
                  // ASSUMPTIONS:
                  // -

                  // create the medication requests
                  // (reason being the stock matter will be address from there)

                  // const mrqs = data.arvRegimens.map(x => {
                  //   return MedicationRequest<ctc.MedicationRequest>({
                  //     id: `mr-${uuid.v4()}`,
                  //     authoredOn: utcDateString(),
                  //     reason: 'Requesting ARV medication from a visit.',
                  //     subject: patient,
                  //     medication: x.medication,
                  //     requester: reference(doctor),
                  //     // information about stocking
                  //     supplyInquiry: null,
                  //   });
                  // });

                  // create medication requests
                  // executeChain([
                  //   executor.medicationRequest(({multiAdd}) => multiAdd(mrqs)),
                  // ])
                  //   .then(() => {
                  //   })
                  //   .then(() => navigation.goBack())
                  //   .catch(err => {
                  //     console.error(err);
                  //     Sentry.captureException(err);
                  //   });

                  // return;
                  if (refVisit === null) {
                    // creating new visit
                    const {
                      visit,
                      appointmentResponse,
                      appointmentRequest,
                      medicationRequests,
                      investigationRequests,
                    } = ctc.createDataForSimpleVisit(
                      () => uuid.v4() as string,
                      patient.id,
                      doctor.id,
                      data,
                    );

                    // TODO: move this to webworker (via webview)
                    // perform storage operations to perform
                    const ops = [
                      // to store visit
                      executor.visit(({add}) => add(visit)),

                      // to store appointment request
                      executor.apptRequest(({add}) => add(appointmentRequest)),

                      // to store the medication requests
                      executor.medicationRequest(({multiAdd}) =>
                        multiAdd(medicationRequests),
                      ),

                      // store the investigation requests
                      executor.investigationRequest(({multiAdd}) =>
                        multiAdd(investigationRequests),
                      ),
                    ];

                    if (appointmentResponse !== null) {
                      // add 'save appointment response' op to the list of ops
                      ops.push(
                        // to store appointment response
                        executor.apptResponse(({add}) =>
                          add(appointmentResponse),
                        ),
                      );
                    }

                    // execute operations in order
                    return executeChain(ops)
                      .then(() =>
                        Toast.showSuccess({
                          text1: 'Visit created',
                          text2: `Tap here to see the patient's file`,
                          onPress() {
                            navigation.goBack();
                            navigation.navigate('ctc.view-patient', {
                              patient,
                            });
                          },
                        }),
                      )
                      .then(() => navigation.goBack())
                      .catch(err => {
                        console.log(err);
                        // ToastAndroid.show(
                        //   'Failed to properly complete the visit. Try again later.',
                        //   ToastAndroid.LONG,
                        // );
                        Toast.showError({
                          text1: 'Oops!',
                          text2: "Couldn't make medication requests",
                        });
                        Sentry.captureException(err);
                      });
                  }

                  // updating existing visit
                  //  and output information
                  const {
                    updatedVisit,
                    medicationRequests,
                    appointmentRequest,
                    investigationRequests,
                  } = ctc.editDataFromSimpleVisit(
                    () => uuid.v4() as string,
                    patient.id,
                    doctor.id,
                    data,
                    refVisit,
                  );

                  const pendingUpdateOps = [
                    // update visit
                    executor.visit(({set}) =>
                      set([updatedVisit.id, updatedVisit]),
                    ),
                    // set medication requests
                    executor.medicationRequest(({multiSet}) =>
                      multiSet(medicationRequests.map(m => [m.id, m])),
                    ),
                  ];

                  if (appointmentRequest !== null) {
                    pendingUpdateOps.push(
                      executor.apptRequest(({set}) =>
                        set([appointmentRequest.id, appointmentRequest]),
                      ),
                    );
                  }

                  if (investigationRequests !== null) {
                    pendingUpdateOps.push(
                      executor.investigationRequest(({multiSet}) =>
                        multiSet(investigationRequests.map(x => [x.id, x])),
                      ),
                    );
                  }

                  return executeChain(pendingUpdateOps)
                    .then(() => {
                      // indicate success
                      // ToastAndroid.show(
                      //   'Updated ctc visit',
                      //   ToastAndroid.SHORT,
                      // );
                      Toast.showSuccess({
                        text1: 'Success',
                        text2: `Updated the patient (${patient.id}) visit`,
                        onPress() {
                          navigation.navigate('ctc.view-patient', {
                            patient,
                          });
                        },
                      }),
                        navigation.goBack();
                    })
                    .catch(err => {
                      console.log(err);
                      // ToastAndroid.show(
                      //   'Failed to properly complete the visit. Try again later.',
                      //   ToastAndroid.LONG,
                      // );
                      Toast.showError({
                        text1: 'Oops!',
                        text2: "Couldn't make medication requests",
                      });
                      Sentry.captureException(err);
                    });
                },
                onDiscard() {
                  navigation.goBack();
                },
              }),
            },
          )}
        />
        <Stack.Screen
          name="ctc.medication-stock"
          component={withFlowContext(MedicationStock, {
            entry: {
              stockCollectionNode: Emr.collection('stock'),
            },
            actions: ({navigation}) => ({
              async setARVStockItem(_id, [medicationId, data]) {
                console.log(_id, medicationId, data);
                const org =
                  doctor.organization.resourceType === 'Organization'
                    ? reference(doctor.organization)
                    : doctor.organization;

                // assumed new medication
                if (_id === null) {
                  // information for new medication
                  const id = _id ?? (uuid.v4() as string);
                  const conc =
                    data.concentrationValue !== null
                      ? removeWhiteSpace(data.concentrationValue).length === 0
                        ? null
                        : parseInt(data.concentrationValue)
                      : 0;
                  const dosage = data.dosage ?? null;
                  const stock = Stock<CTC.ARVStockRecord>({
                    count: parseInt(data.count ?? '0'),
                    expiresAt: format(
                      convertDMYToDate(data.expiresAt),
                      'yyyy-MM-dd',
                    ),
                    id,
                    medication:
                      data.type === 'single'
                        ? Medication<CTC.SingleARVMedication>({
                            type: 'single',
                            form: data.form,
                            id: `${data.identifier}-${uuid.v4()}`,
                            identifier: data.identifier as ARV.UnitRegimen,
                            text: data.text,
                            category: 'arv-ctc',
                          })
                        : Medication<CTC.ARVMedication>({
                            identifier: _.kebabCase(data.text),
                            id: `${data.identifier}-${uuid.v4()}`,
                            form: data.form,
                            ingredients: data.ingredients.map(identifier =>
                              Ingredient({
                                identifier,
                                text:
                                  ARV.units.fromKey(identifier) ?? identifier,
                              }),
                            ),
                            text: data.text,
                            category: 'arv-ctc',
                            type: (data.type as 'composed') ?? 'composed',
                          }),
                    managingOrganization: org,
                    dosage: dosage,
                    extendedData: {
                      estimatedFor: data.estimatedFor,
                      group: data.group,
                      isLow: false,
                    },
                    concentration: conc
                      ? {
                          amount: conc,
                          units:
                            data.form === 'granules'
                              ? 'mg'
                              : data.form === 'syrup'
                              ? 'cc'
                              : 'tablets',
                        }
                      : null,
                    // set last update
                    lastUpdatedAt: utcDateString(),
                  });

                  await executeChain([executor.stock(({add}) => add(stock))]);
                } else {
                  const s =
                    (
                      await query(Emr.collection('stock'), {
                        where: item => item.id === _id,
                      })
                    ).get(0) ?? null;

                  if (s === null) {
                    Toast.showError({
                      text1: 'No stock info',
                      text2: `Unable to locate the information for stock record with ID [${_id}]`,
                    });
                    // ToastAndroid.show('Unable to update!', ToastAndroid.SHORT);
                    return;
                  }
                  // get proper medication
                  console.log(data);

                  await updateDoc(doc(Emr.collection('stock'), _id), {
                    lastUpdatedAt: utcDateString(),
                    medication:
                      data.type === 'single'
                        ? Medication<CTC.SingleARVMedication>({
                            id: medicationId,
                            type: 'single',
                            form: data.form,
                            identifier: data.identifier as ARV.UnitRegimen,
                            text: data.text,

                            category: 'arv-ctc',
                          })
                        : Medication<CTC.ARVMedication>({
                            id: medicationId,
                            identifier: _.kebabCase(data.text),
                            form: data.form,
                            ingredients: data.ingredients.map(identifier =>
                              Ingredient({
                                identifier,
                                text:
                                  ARV.units.fromKey(identifier) ?? identifier,
                              }),
                            ),
                            alias: data.text,
                            text: data.text,
                            category: 'arv-ctc',
                            type: (data.type as 'composed') ?? 'composed',
                          }),
                    extendedData: {
                      estimatedFor: data.estimatedFor,
                      group: data.group,
                      isLow: false,
                    },
                    count: parseInt(data.count ?? '0'),

                    expiresAt: format(
                      convertDMYToDate(data.expiresAt),
                      'yyyy-MM-dd',
                    ),
                  });

                  // ...
                }

                Toast.showInfo({
                  text1: 'Stock Information Updated',
                });

                // indicate success
                // ToastAndroid.show(
                //   'Updated stock medication',
                //   ToastAndroid.SHORT,
                // );
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.register-new-patient"
          component={withFlowContext(RegisterNewPatientScreen, {
            entry: {myCtcId: provider.facility.ctcCode},
            actions: ({navigation}) => ({
              async checkIfPatientExists(patientId) {
                const s = await query(Emr.collection('patients'), {
                  where: item => item.id === patientId,
                });

                return s.count() > 0;
              },
              onRegisterPatient(patient, investigations, cb) {
                console.log(patient);
                const {
                  patient: newPatient,
                  investigationRequests,
                  adhocVisit,
                } = ctc.registerNewPatient(
                  () => uuid.v4() as string,
                  patient,
                  doctor.id,
                  investigations,
                  organization,
                );

                const ops = [
                  executor.patient(({add}) => add(newPatient)),
                  executor.investigationRequest(({multiAdd}) =>
                    multiAdd(investigationRequests),
                  ),
                ];

                if ((adhocVisit ?? null) !== null) {
                  ops.push(executor.visit(({add}) => add(adhocVisit)));
                }

                executeChain(ops)
                  .then(() => {
                    Toast.showSuccess({
                      text1: 'Registered New Patient',
                      text2: `Patient ${newPatient.id} has been registered to your facility`,
                    });
                    // ToastAndroid.show(
                    //   'Patient ' + patient.patientId + ' registered !.',
                    //   ToastAndroid.SHORT,
                    // );
                    navigation.navigate('ctc.view-patient', {
                      patient: newPatient,
                      organization,
                    });
                  })
                  .catch(err => {
                    Toast.showSuccess({
                      text1: 'Registration Failed',
                      text2: `Couldn't register the patient (${newPatient.id}). Please try again later`,
                    });
                    // ToastAndroid.show(
                    //   'Unable to register patient. Please try again later',
                    //   ToastAndroid.LONG,
                    // );
                    Sentry.captureException(err);
                  });
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.patient-dashboard"
          component={withFlowContext(PatientDashboard, {
            actions: ({navigation}) => ({
              getMyCTCId: () => provider.facility.ctcCode,
              getPatientsFromQuery(query) {
                return queryPatientsFromSearch(
                  Emr.collection('patients'),
                  query,
                  patient => {
                    const firstName = (patient.info?.firstName ?? '').trim();
                    const familyName = (patient.info?.familyName ?? '').trim();
                    const fullName = (firstName + ' ' + familyName).trim();
                    return {
                      id: patient.id,
                      name: fullName.length === 0 ? null : fullName,
                      registeredDate: new Date(patient.createdAt),
                      onNewVisit: () => {
                        navigation.navigate('ctc.medication-visit', {
                          patient,
                          organization,
                        });
                      },
                      onViewProfile: () => {
                        navigation.navigate('ctc.view-patient', {
                          patient,
                          organization,
                        });
                      },
                    };
                  },
                );
              },
              onNewPatient() {
                navigation.navigate('ctc.register-new-patient');
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.view-patient"
          component={withFlowContext(ViewPatientScreen<CTC.Patient>, {
            entry: {
              organization,
            },
            actions: ({navigation}) => ({
              onToEditPatient(patient) {
                const {id, ...other} = patient;
                const {
                  dateOfHIVPositiveTest: dateOfTest,
                  dateOfStartARV: dateStartedARVs,
                  isCurrentlyOnARV,
                  hasPositiveStatus,
                  hasTreatmentSupport,
                  typeOfSupport,
                  whoStage,
                } = other.extendedData ?? {};
                // ...
                navigation.navigate('ctc.edit-patient', {
                  ref: patient,
                  patient: {
                    id,
                    firstName: other.info?.firstName,
                    familyName: other.info?.familyName,
                    phoneNumber: other.contact?.phoneNumber,
                    maritalStatus: other.maritalStatus,

                    // reformat the date
                    dateOfBirth: format(
                      date(other.birthDate),
                      'dd / MM / yyyy',
                    ),
                    resident: (other.info?.address ?? '')
                      .replace('District', '')
                      .trim(),
                    hasPositiveTest: Boolean(hasPositiveStatus),
                    hasPatientOnARVs: Boolean(isCurrentlyOnARV),
                    dateOfTest,
                    dateStartedARVs,

                    sex: other.sex,
                    whoStage,
                    hasTreatmentSupport: Boolean(hasTreatmentSupport),
                    typeOfSupport,
                  },
                });
              },
              onNewVisit(patient) {
                navigation.navigate('ctc.medication-visit', {
                  patient,
                  organization,
                });
              },
              async nextAppointment(patientId: string) {
                const after = await query(
                  Emr.collection('appointment-requests'),
                  {
                    where: {
                      $and: [
                        item =>
                          isAfter(new Date(item.appointmentDate), new Date()),
                        item => {
                          return (item.participants ?? [])
                            .map(d => d.id)
                            .includes(patientId);
                        },
                      ],
                    },
                    order: {
                      type: 'asc',
                      field: item => new Date(item.appointmentDate).getTime(),
                    },
                  },
                );

                const d = after.get(0) ?? null;

                if (d !== null) {
                  return {
                    appointmentDate: format(
                      new Date(d.appointmentDate),
                      'yyyy, MMMM dd',
                    ),
                  };
                }

                return null;
              },
              async fetchInvestigationRequests(patientId) {
                return (
                  await query(Emr.collection('investigation-requests'), {
                    where: item => item.subject.id === patientId,
                  })
                )
                  .map(ir => ({
                    requestId: ir.id,
                    requestDate: ir.createdAt,
                    text:
                      Investigation.item.fromKey(ir.data.investigationId) ??
                      ir.data.investigationId,
                    onViewInvestigation: () => {
                      // console.log('Going to the page with:', {
                      //   request: ir.id,
                      //   investigationIdentifier: ir.data.investigationId,
                      //   investigationName: Investigation.item.fromKey(
                      //     ir.data.investigationId,
                      //   ),
                      //   obj: ir,
                      // });
                      navigation.navigate('ctc.view-investigation', {
                        request: {
                          id: ir.id,
                          investigationIdentifier: ir.data.investigationId,
                          investigationName: Investigation.item.fromKey(
                            ir.data.investigationId,
                          ),
                          obj: ir,
                        },
                      });
                    },
                  }))
                  .toArray();
              },
              async fetchVisits(patientId) {
                return (
                  await query(Emr.collection('visits'), {
                    where: {
                      $and: [
                        item => item.subject.id === patientId,

                        // TODO: include type to represent adhoc visit
                        // this will exclude all adhoc visits
                        item => item.extendedData !== null,
                      ],
                    },
                  })
                )
                  .map(d => ({
                    visitDate: d.date ?? d.createdAt,
                    'medication-requests-count': d.prescriptions.length,
                    onViewVisit: () => {
                      navigation.navigate('ctc.view-visit', {visit: d});
                    },
                    onEditVisit: async () => {
                      const patients = await query(Emr.collection('patients'), {
                        where: item => item.id === patientId,
                      });

                      const patient = patients.get(0) ?? null;

                      if (patient !== null) {
                        navigation.navigate('ctc.medication-visit', {
                          patient,
                          organization,
                          visit: d,
                          initialState: {
                            dateOfVisit: format(
                              new Date(d.date ?? d.createdAt),
                              'dd / MM / yyyy',
                            ),
                            ...d.extendedData,
                          },
                        });
                      } else {
                        // ...
                        Toast.showWarn({
                          text1: 'Patient not found',
                          text2:
                            'Make sure the patient exists, or please try again later',
                        });
                        // ToastAndroid.show(
                        //   'Patient is missing, unable to edit visit',
                        //   ToastAndroid.LONG,
                        // );
                      }
                    },
                  }))
                  .toArray();
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.view-visit"
          component={withFlowContext(ViewVisitScreen, {
            actions: ({navigation}) => ({
              onNext() {},
              // Load result from investigation request
              async getInvestigationResult(invRequest) {
                // ...
              },
            }),
            entry: {
              visit: {
                assessments: [],
                authorizingAppointment: null,
                createdAt: new Date().toISOString(),
                code: null,
                extendedData: {},
                id: uuid.v4() as string,
                investigationRequests: [
                  {
                    code: null,
                    createdAt: new Date().toISOString(),
                    id: uuid.v4() as string,
                    requester: practitioner(provider),
                    resourceType: 'InvestigationRequest',
                    subject: {
                      id: '11111111111111',
                      resourceReferenced: 'Patient',
                      resourceType: 'Reference',
                    },
                    data: {
                      investigationId: 'cd-4-count',
                      obj: Investigation.fromKey('cd-4-count'),
                    },
                  },
                ],
                practitioner: practitioner(provider),
                prescriptions: [],
                subject: {
                  id: '11111111111111',
                  resourceReferenced: 'Patient',
                  resourceType: 'Reference',
                },
                resourceType: 'Visit',
              },
            },
          })}
        />
        <Stack.Screen
          name="ctc.view-medication-dispenses"
          component={withFlowContext(MedicationDispenseScreen, {
            actions: ({navigation}) => ({
              async getMedicationDispenses() {
                return (
                  await getDocs(Emr.collection('medication-dispenses'))
                ).map(d => d[1]);
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.view-single-medication-request"
          component={withFlowContext(MedicationRequestScreen, {
            actions: ({navigation}) => ({
              async getMedicationDispenses() {
                return (
                  await getDocs(Emr.collection('medication-dispenses'))
                ).map(d => d[1]);
              },
              onIgnoreRequest() {
                navigation.goBack();
              },
              onAcceptMedicationRequest(medicationRequest, finish) {
                // 1. update the stock information for the medication (assuming possible)
                const med = medicationRequest.medication;

                const now = new Date();
                // amount of medication taken
                const count = 1;

                // creates a medication dispense object
                const dispense = MedicationDispense<ctc.MedicationDispense>({
                  id: `md-${uuid.v4()}`,
                  authorizingRequest: {
                    id: medicationRequest.id,
                    resourceType: 'Reference',
                    resourceReferenced: 'MedicationRequest',
                  },
                  createdAt: utcDateString(now),
                  dosageAndRate: {
                    count: count,
                    type: med.form,
                  },
                  medication: med,
                  supplier: practitioner(provider),
                });

                const stockColl = Emr.collection('stock');
                // check for the medication requested from stock
                executeChain([
                  () =>
                    // update stock information
                    query(stockColl, {
                      where: item =>
                        item.medication.identifier === med.identifier,
                    })
                      .then(stockRecords =>
                        Promise.all(
                          stockRecords.map(async record => {
                            updateDoc(doc(stockColl, record.id), {
                              lastUpdatedAt: utcDateString(now),
                              count: record.count - count,
                            });
                          }),
                        ),
                      )
                      .catch(err => {
                        Toast.showError({
                          text1: "Couldn't update stock",
                          text2: err.message,
                        });
                      }),

                  // save the medication dispense
                  executor.medicationDispense(({add}) => add(dispense)),

                  // TODO: HERE!!!
                  () =>
                    Toast.showSuccess({
                      text1: 'Accepted Request',
                      text2: `Confirmed request for medication '${med.text}' for ${medicationRequest.subject.id} `,
                    }),
                  () => finish(),
                  () => navigation.goBack(),
                ]);
              },
            }),
          })}
        />
        <Stack.Screen
          name="ctc.medications-dashboard"
          component={withFlowContext(MedicationsDashboardScreen, {
            actions: ({navigation}) => ({
              async getMedicationRequests() {
                return (
                  await getDocs(Emr.collection('medication-requests'))
                ).map(d => d[1]);
              },

              async getMedicationDispenseFrom(medicationRequest: MedicaReq) {
                const d = List(
                  await getDocs(Emr.collection('medication-dispenses')),
                );

                const match = d.find(
                  ([_, data]) =>
                    data.authorizingRequest.id === medicationRequest.id,
                );

                return match?.[1] ?? null;
              },
              onShowMedicationRequest(request) {
                navigation.navigate('ctc.view-single-medication-request', {
                  request,
                });
              },
              onShowAllMedicationDispenses() {
                navigation.navigate('ctc.view-medication-dispenses');
              },
            }),
          })}
        />
        {/* Visit something */}
      </Stack.Navigator>
    </SafeAreaView>
  );
}
// export default function (props: {provider: ElsaProvider}) {
//   return (
//     <>
//       <App {...props} />
//     </>
//   );
// }
