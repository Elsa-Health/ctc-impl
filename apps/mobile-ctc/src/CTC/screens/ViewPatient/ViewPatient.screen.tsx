import React from 'react';

import {Layout, Text} from '@elsa-ui/react-native/components';
import {useTheme} from '@elsa-ui/react-native/theme';
import {ScrollView, ToastAndroid, View} from 'react-native';
import {Column, Item, Row, Section, TitledItem} from '../../temp-components';
import {WorkflowScreenProps} from '@elsa-ui/react-native-workflows';
import {
  ActivityIndicator,
  Button,
  Divider,
  IconButton,
} from 'react-native-paper';
import {CTCOrganization} from '../../emr-helpers/types';
import {useAsync, useAsyncRetry} from 'react-use';
import {format} from 'date-fns';
import {Linking} from 'react-native';

export type VisitItem = {
  visitDate: UTCDateTimeString;
  'medication-requests-count': number;
  onViewVisit: () => void;
  onEditVisit: () => void;
};

export type InvestigationRequestItem = {
  onViewInvestigation: () => void;
  requestId: string;
  requestDate: Date | string;
};

export type NextAppointmentItem = {
  appointmentDate: string;
};
export default function ViewPatientScreen<CTCPatient>({
  entry: e,
  actions: $,
}: WorkflowScreenProps<
  {
    patient: CTCPatient;
    organization: CTCOrganization;
  },
  {
    onToEditPatient: (patient: CTCPatient) => void;
    nextAppointment: (patientId: string) => Promise<null | NextAppointmentItem>;
    fetchVisits: (patientId: string) => Promise<VisitItem[]>;
    onNewVisit: (patient: CTCPatient) => void;
    fetchInvestigationRequests: (
      patientId: string,
    ) => Promise<InvestigationRequestItem[]>;
  }
>) {
  const {spacing} = useTheme();
  const name = (
    (e.patient.info?.firstName ?? '') +
    ' ' +
    (e.patient.info?.familyName ?? '')
  ).trim();

  const {value} = useAsync(async () => {
    return $.nextAppointment(e.patient.id);
  }, [e.patient]);

  // setup the phoneNumber
  const phone = e.patient.contact?.phoneNumber?.replace('(+255)', '') ?? null;
  return (
    <Layout title="View Patient" style={{padding: 0}}>
      <ScrollView
        contentContainerStyle={{padding: spacing.md}}
        style={{flex: 1}}>
        <Section
          mode="raised"
          title="Patient"
          desc="Information about the patient"
          removeLine
          right={
            Boolean(phone) && (
              <IconButton
                icon="phone"
                size={20}
                color="#4665af"
                onPress={() => Linking.openURL(`tel:${phone}`)}
              />
            )
          }>
          <Column>
            <TitledItem title="ID">{e.patient.id}</TitledItem>
            <TitledItem spaceTop title="Name">
              {name.length > 0 ? name : 'N/A'}
            </TitledItem>
            <TitledItem spaceTop title="Managing Facility">
              {e.patient.managingOrganization?.name ?? '-'} (
              {e.patient.managingOrganization?.identifier?.ctcCode ?? 'N/A'})
            </TitledItem>
          </Column>
          <Column spaceTop>
            <Button
              icon={'account-edit'}
              mode="outlined"
              onPress={() => $.onToEditPatient(e.patient)}>
              Edit Profile
            </Button>
          </Column>
        </Section>
        {/* Next expected appointment */}
        {(value?.appointmentDate ?? null) !== null && (
          <Section
            title="Next expected appointment"
            mode="raised"
            removeLine
            spaceTop>
            <View>
              <Text>{value.appointmentDate}</Text>
            </View>
          </Section>
        )}

        <Item spaceTop>
          <Button
            icon={'file-plus'}
            mode="contained"
            onPress={() => $.onNewVisit(e.patient)}>
            New Visit
          </Button>
        </Item>

        {/* Recent Investigation Requests */}
        <InvestigationRequests
          fetch={() => $.fetchInvestigationRequests(e.patient.id)}
        />
        {/* Past Visits */}
        <HistorySection fetchVisits={() => $.fetchVisits(e.patient.id)} />
      </ScrollView>
    </Layout>
  );
}

function InvRequestItem({hist: hist}: {hist: InvestigationRequestItem}) {
  return (
    <Column contentStyle={{marginVertical: 8}}>
      <View>
        <TitledItem title="Request Date">
          {format(new Date(hist.requestDate), 'MMMM dd, yyyy')}
        </TitledItem>
        <TitledItem title="Investigation" spaceTop>
          {hist.text}
        </TitledItem>
      </View>
      <View style={{marginTop: 8}}>
        <Button
          icon="file-eye-outline"
          mode="outlined"
          onPress={hist.onViewInvestigation}>
          View
        </Button>
      </View>
    </Column>
  );
}
function InvestigationRequests({
  fetch: fetch,
}: {
  fetch: () => Promise<InvestigationRequestItem[]>;
}) {
  const {loading, error, retry, value} = useAsyncRetry(fetch, [fetch]);

  // console.log(value);
  if (loading) {
    return (
      <View style={{marginVertical: 8, paddingVertical: 8}}>
        <ActivityIndicator animating />
        <Text>Loading History</Text>
      </View>
    );
  }

  if (error || value === undefined) {
    return (
      <View style={{marginVertical: 8, paddingVertical: 8}}>
        <Text italic style={{textAlign: 'center'}}>
          Unable to show the recent investigation requests. There seems to be an
          error
        </Text>
      </View>
    );
  }

  return (
    <Section
      title="Investigation Requests"
      desc="Recent investigation requests for the patients"
      spaceTop
      right={
        <IconButton
          icon="refresh"
          size={20}
          color="#4665af"
          onPress={() => {
            ToastAndroid.show('Updating information', ToastAndroid.SHORT);
            retry();
          }}
        />
      }>
      {value.length === 0 && (
        <Text italic style={{textAlign: 'center'}}>
          There are no investigation requests made for this patient
        </Text>
      )}
      {value.map((hist, ix) => (
        <React.Fragment key={ix}>
          <InvRequestItem hist={hist} />
          <Divider />
        </React.Fragment>
      ))}
    </Section>
  );
}

function HistorySection({
  fetchVisits,
}: {
  fetchVisits: () => Promise<VisitItem[]>;
}) {
  const {loading, error, retry, value} = useAsyncRetry(fetchVisits, [
    fetchVisits,
  ]);

  if (loading) {
    return (
      <View style={{marginVertical: 8, paddingVertical: 8}}>
        <ActivityIndicator animating />
        <Text>Loading History</Text>
      </View>
    );
  }

  if (error || value === undefined) {
    return (
      <View style={{marginVertical: 8, paddingVertical: 8}}>
        <Text italic style={{textAlign: 'center'}}>
          Unable to show the history. There seems to be an error
        </Text>
      </View>
    );
  }

  return (
    <Section
      title="History"
      desc="Patient's previous activity"
      spaceTop
      right={
        <IconButton
          icon="refresh"
          size={20}
          color="#4665af"
          onPress={() => {
            ToastAndroid.show('Updating information', ToastAndroid.SHORT);
            retry();
          }}
        />
      }>
      {value.length === 0 && (
        <Text italic style={{textAlign: 'center'}}>
          There are no visits that are recorded against this patient
        </Text>
      )}
      {value.map((visit, ix) => (
        <React.Fragment key={ix}>
          <HistoryItem visit={visit} />
          <Divider />
        </React.Fragment>
      ))}
    </Section>
  );
}

function HistoryItem({visit}: {visit: VisitItem}) {
  return (
    <Row contentStyle={{marginVertical: 8}}>
      <View>
        <TitledItem title="Visit Date">
          {format(new Date(visit.visitDate), 'MMMM dd, yyyy')}
        </TitledItem>
        <TitledItem title="Medication Requests" spaceTop>
          {visit['medication-requests-count']}
        </TitledItem>
      </View>
      <View>
        {/* <Button
          icon="file-eye-outline"
          mode="outlined"
          onPress={visit.onViewVisit}>
          View
        </Button> */}
        <Button
          icon="square-edit-outline"
          mode="outlined"
          onPress={visit.onEditVisit}>
          {'View & Edit'}
        </Button>
      </View>
    </Row>
  );
}
