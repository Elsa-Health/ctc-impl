import React from 'react';

import {Layout, Text} from '@elsa-ui/react-native/components';
import {useTheme} from '@elsa-ui/react-native/theme';
import {ScrollView, View} from 'react-native';
import {
  Block,
  Column,
  Row,
  Section,
  TitledItem,
  TouchableItem,
} from '../../temp-components';
import {WorkflowScreenProps} from '@elsa-ui/react-native-workflows';
import {Button, TouchableRipple} from 'react-native-paper';

import CollapsibleView from 'react-native-collapsible';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated';
import {InvReq} from '../../emr-helpers/hook';
import {Investigation} from 'elsa-health-data-fns/lib';
import {useAsyncRetry} from 'react-use';

export default function ViewVisitScreen<CTCVisit>({
  entry: {visit},
  actions: $,
}: WorkflowScreenProps<
  {visit: CTCVisit},
  {
    onNext: () => void;
    onAddInvestigationResult: () => void;
    onUpdateInvestigationResult: () => void;
  }
>) {
  const {spacing} = useTheme();

  return (
    <Layout title="Visit" style={{padding: 0}}>
      <ScrollView
        contentContainerStyle={{paddingHorizontal: spacing.md}}
        style={{flex: 1}}>
        {/* Past Visits */}
        <Section spaceTop mode="raised">
          <Row icon="calendar">
            <Text>Date of Visit</Text>
            <Text font="bold">26, April 2022</Text>
          </Row>
        </Section>
        <Section desc="Basic details" mode="raised" spaceTop>
          <Row>
            <TitledItem title="Sex">Male</TitledItem>
            <TitledItem title="Age" spaceTop>
              24 years and 4 months
            </TitledItem>
          </Row>
          <TitledItem title="Type of Visit" spaceTop>
            Home Visit
          </TitledItem>
        </Section>
        <Section title="Assessment" spaceTop>
          <Text>Something</Text>
        </Section>
        <Section title="Medication Requests">
          {visit.prescriptions.map(medReq => (
            <></>
          ))}
        </Section>
      </ScrollView>
    </Layout>
  );
}
