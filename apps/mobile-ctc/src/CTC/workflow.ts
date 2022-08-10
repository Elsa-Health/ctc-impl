import {buildWorkflowStore, WorkflowNavigator} from '../workflows';

import DashboardScreen from './screens/Dashboard';
import PatientDashboard from './screens/PatientDashboard';
import MedicationsDashboardScreen from './screens/MedicationDashboard';
import ReportSummaryScreen from './screens/ReportSummary';

import ViewAppointmentsScreen from './screens/ViewAppointments';
import ViewVisitScreen from './screens/ViewVisit';
import ViewPatientScreen from './screens/ViewPatient';
import ViewInvestigationScreen from './screens/ViewInvestigation';

import EditPatientScreen from './screens/EditPatient';
import MedicationMapScreen from './screens/MedicationMap';
import RegisterNewPatientScreen from './screens/RegisterNewPatient';
import ReportMissedAppointmentScreen from './screens/ReportMissedAppointment';

import MedicationDispenseScreen from './screens/MedicationDispense';
import MedicationRequestScreen from './screens/MedicationRequest';

// import NewVisitEntryScreen from './_screens/BasicPatientIntake';
// import HIVStageIntakeScreen from './_screens/HIVStageIntake';
// import HIVAdherenceAssessmentScreen from './_screens/HIVAdherenceAssessment';
// import ConcludeAssessmentScreen from './_screens/ConcludeAssessment';

import MedicationVisit from './screens/MedicationVisit';
import MedicationStock from './screens/MedicationStock';
import * as ctc from '@elsa-health/emr/lib/ctc/ctc.types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {List} from 'immutable';

// These are all the pages to navigate to
export type WorkflowParamList = WorkflowNavigator<{
  'ctc.dashboard': typeof DashboardScreen;
  // DashboardScreen
  'ctc.patient-dashboard': typeof PatientDashboard;
  'ctc.medications-dashboard': typeof MedicationsDashboardScreen;

  'ctc.view-investigation': typeof ViewInvestigationScreen<ctc.InvestigationRequest>;
  'ctc.report-missed-appointments': typeof ReportMissedAppointmentScreen;
  'ctc.view-appointments': typeof ViewAppointmentsScreen;
  'ctc.medication-map': typeof MedicationMapScreen;
  'ctc.report-summary': typeof ReportSummaryScreen;
  'ctc.medication-visit': typeof MedicationVisit<
    ctc.Patient,
    ctc.Visit,
    ctc.Organization
  >;
  'ctc.medication-stock': typeof MedicationStock;
  'ctc.register-new-patient': typeof RegisterNewPatientScreen;
  'ctc.edit-patient': typeof EditPatientScreen;

  'ctc.view-patient': typeof ViewPatientScreen;
  'ctc.view-visit': typeof ViewVisitScreen;
  'ctc.view-medication-dispenses': typeof MedicationDispenseScreen;
  'ctc.view-single-medication-request': typeof MedicationRequestScreen;
}>;

// Setup the application
const {WorkflowProvider, useWorkflowStore, useWorkflowApi} =
  buildWorkflowStore<{
    appointments: List<any>;
    visits: List<ctc.Visit>;
    patients: List<ctc.Patient>;
    'appointment-requests': List<ctc.AppointmentRequest>;
    'appointment-responses': List<ctc.AppointmentResponse>;
    'medication-requests': List<ctc.MedicationRequest>;
    stock: any;
  }>();

const Stack = createNativeStackNavigator<WorkflowParamList>();

// Something here
export {WorkflowProvider, Stack, useWorkflowStore, useWorkflowApi};

// start
