import React from 'react';

import {Layout, Text} from '@elsa-ui/react-native/components';
import {useTheme} from '@elsa-ui/react-native/theme';
import {ScrollView, View} from 'react-native';
import {Button, Divider, RadioButton, TextInput} from 'react-native-paper';
import {Block, Column, Row, Section, TitledItem} from '../../temp-components';
import {WorkflowScreenProps} from '@elsa-ui/react-native-workflows';
import {MedicaDisp} from '../../emr-helpers/hook';
import {useAsyncRetry} from 'react-use';
import {List} from 'immutable';
import {format} from 'date-fns';
import {ctc} from '@elsa-health/emr';
import {FlashList} from '@shopify/flash-list';

export default function MedicationDispenseScreen({
  actions: $,
}: WorkflowScreenProps<
  {},
  {getMedicationDispenses: () => Promise<MedicaDisp[]>}
>) {
  const {spacing} = useTheme();
  const {loading, value, retry, error} = useAsyncRetry(async () => {
    return List(await $.getMedicationDispenses());
  });

  if (error) {
    return (
      <View style={{flex: 1, padding: spacing.md}}>
        <Text>Unable to load the responded medication requests</Text>
      </View>
    );
  }

  return (
    <Layout title="Medication Dispenses" style={{padding: 0}}>
      {loading && (
        <View style={{flex: 1, padding: spacing.md}}>
          <Text>Loading...</Text>
        </View>
      )}
      {value !== undefined && (
        <ScrollView
          contentContainerStyle={{paddingHorizontal: spacing.md}}
          style={{flex: 1}}>
          {/* Missed Appointments */}
          <Section
            title="Requests responded"
            desc="List of medication requests accepted"
            right={
              <Button icon="refresh" onPress={retry}>
                Refresh
              </Button>
            }>
            {value.count() > 0 ? (
              <FlashList
                data={value.toArray()}
                estimatedItemSize={10}
                renderItem={({item}) => (
                  <MedicationResponseItem response={item} />
                )}
              />
            ) : (
              <View style={{flex: 1}}>
                <Text style={{textAlign: 'center'}} italic>
                  There aren't any requests that have been responded to
                </Text>
              </View>
            )}
          </Section>
        </ScrollView>
      )}
    </Layout>
  );
}

function MedicationResponseItem({
  response,
}: {
  response: ctc.MedicationDispense;
}) {
  return (
    <View style={{minHeight: 40}}>
      <View style={{paddingVertical: 10}}>
        <Text size={'xs'} color="#777">
          {response.id}
        </Text>
        <TitledItem title="Medication">
          {response.medication.text} ({response.medication.form})
        </TitledItem>

        <Row spaceTop contentStyle={{justifyContent: 'flex-start'}}>
          <TitledItem title="Associated Facility" style={{marginRight: 8}}>
            {response.supplier?.organization.data.ctcCode}
          </TitledItem>
          <TitledItem title="Supplied By">
            {response.supplier?.name ?? `ID: response.supplier?.id`}
          </TitledItem>
        </Row>

        <Row spaceTop contentStyle={{justifyContent: 'flex-start'}}>
          <TitledItem title="Responded At">
            {format(new Date(response.createdAt), 'MMMM dd, yyyy')}
          </TitledItem>
        </Row>
      </View>
      <Divider />
    </View>
  );
}
