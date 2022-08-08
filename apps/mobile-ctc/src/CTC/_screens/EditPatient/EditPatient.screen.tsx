import React from 'react';

import {Layout, Text} from '@elsa-ui/react-native/components';
import {useTheme} from '@elsa-ui/react-native/theme';
import {ScrollView, View} from 'react-native';
import {Button, RadioButton, TextInput} from 'react-native-paper';
import {
  Column,
  ControlDateInput,
  Item,
  Picker,
  Row,
  Section,
  TitledItem,
} from '../../temp-components';

import {WorkflowScreenProps} from '@elsa-ui/react-native-workflows';

import TextInputMask from 'react-native-text-input-mask';
import _ from 'lodash';

import {useForm, Controller} from 'react-hook-form';
import {Investigation} from 'elsa-health-data-fns/lib';

const DISTRICTS = [
  'Meru',
  'Arusha City',
  'Arusha',
  'Karatu',
  'Longido',
  'Monduli',
  'Ngorongoro',
  'Hai',
  'Moshi',
  'Moshi Municipal',
  'Mwanga',
  'Rombo',
  'Same',
  'Siha',
  'Other',
].sort((a, b) => a.localeCompare(b));

const ARV_WHO_STAGES = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'];

const TYPE_O_TREATMENT_SUPPORT = [
  'Family',
  'Friends',
  'Partner / Spouse',
  'Community Group',
];

export type PatientFormType = {
  firstName: string;
  familyName: string;
  phoneNumber: string;
  resident: string;

  // for DOB
  dateOfBirth: string;

  maritalStatus: string;

  // HIV+ status
  hasPositiveTest: boolean;
  dateOfTest?: string | undefined;

  // ARVs
  hasPatientOnARVs: boolean;
  dateStartedARVs?: string | undefined;

  // WHO
  whoStage: string;

  hasTreatmentSupport: boolean;
  typeOfSupport?: string | undefined;

  sex: Sex;
};
const MARITAL_STATUS = [
  'Single',
  'Married',
  'Cohabiting',
  'Divorced / Separated',
  'Widow / Widowed',
];

export default function EditPatientScreen<
  RefPatient,
  Patient extends {id: string} & PatientFormType = {
    id: string;
  } & PatientFormType,
>({
  entry: {
    patient: {id, ...patient},
    ref: referencePatient,
  },
  actions: $,
}: WorkflowScreenProps<
  {patient: Patient; ref: RefPatient},
  {
    onSavePatientEdit: (
      id: string,
      edittedRecord: PatientFormType,
      referencePatient: RefPatient,
    ) => void;
  }
>) {
  const {spacing} = useTheme();
  const {handleSubmit, control} = useForm<PatientFormType>({
    defaultValues: Object.assign(
      // These are the default value assignment
      {
        firstName: '',
        familyName: '',
        phoneNumber: '',
        resident: DISTRICTS[0],
        dateOfBirth: '',
        maritalStatus: 'Single', // modified late
        hasPositiveTest: false,
        dateOfTest: '',
        hasPatientOnARVs: false,
        dateStartedARVs: '',
        whoStage: 'Stage 1',
        hasTreatmentSupport: false,
        typeOfSupport: 'Family',
        sex: 'male',
        investigations: [],
      },
      patient ?? {},
    ),
  });

  const onSubmit = handleSubmit(({...value}) => {
    return $.onSavePatientEdit(id, value, referencePatient);
  });

  return (
    <>
      <Layout title="Edit Patient" style={{padding: 0}}>
        <ScrollView
          contentContainerStyle={{padding: spacing.md}}
          style={{flex: 1}}>
          <Section
            title="Patient Identification"
            desc="Identify the patient you are registering">
            {/* Patient ID */}
            <Column wrapperStyle={{marginVertical: 16}}>
              {/* <Text>Patient CTC ID</Text> */}
              <TitledItem title="Patient CTC ID">{id}</TitledItem>
            </Column>

            {/* Sex */}
            <Column spaceTop>
              <Text>Sex</Text>
              <Controller
                name="sex"
                control={control}
                render={({field: {onChange, value}}) => (
                  <RadioButton.Group value={value} onValueChange={onChange}>
                    <View style={{flexDirection: 'row'}}>
                      <RadioButton.Item label="Male" value="male" />
                      <RadioButton.Item label="Female" value="female" />
                    </View>
                  </RadioButton.Group>
                )}
              />
            </Column>
            <Column spaceTop>
              <Text>Date of Birth</Text>
              <ControlDateInput
                name="dateOfBirth"
                control={control}
                required
                dateTimeProps={{maxDate: new Date()}}
              />
            </Column>
          </Section>
          {/* Register Patient*/}
          <Section
            mode="raised"
            style={{paddingVertical: 24, paddingHorizontal: 24}}
            title="Helpful Patient Details"
            removeLine
            spaceBottom
            spaceTop
            desc="Set information that can be used in searching the patient later.">
            <Row>
              <Controller
                name="firstName"
                control={control}
                render={({field: {onChange, value, onBlur}}) => (
                  <TextInput
                    style={{flex: 1, marginRight: 8, backgroundColor: '#FFF'}}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    label="First Name"
                  />
                )}
              />
              <Controller
                name="familyName"
                control={control}
                render={({field: {onChange, ...other}}) => (
                  <TextInput
                    style={{flex: 1, backgroundColor: '#FFF'}}
                    onChangeText={onChange}
                    {...other}
                    label="Family Name"
                  />
                )}
              />
            </Row>
            <Item>
              <Controller
                name="phoneNumber"
                control={control}
                render={({field: {onChange, ...other}}) => (
                  <TextInput
                    style={{flex: 1, backgroundColor: '#FFF'}}
                    onChangeText={onChange}
                    {...other}
                    label="Phone Number"
                    render={props => (
                      <TextInputMask
                        {...props}
                        mask="(+255) 0[000] [000] [000]"
                      />
                    )}
                  />
                )}
              />
            </Item>
          </Section>
          {/* More on Patient  */}
          <Section title="Other Patient Information" spaceTop>
            <Column>
              <Text>Marital Status</Text>
              <Controller
                name="maritalStatus"
                control={control}
                render={({field}) => (
                  <Picker
                    label="Marital Status"
                    items={MARITAL_STATUS}
                    selectedKey={field.value}
                    renderText={_.capitalize}
                    onChangeValue={field.onChange}
                  />
                )}
              />
            </Column>
            <Column spaceTop>
              <Text>District of residence</Text>
              <Controller
                name="resident"
                control={control}
                render={({field}) => (
                  <Picker
                    label="Districts"
                    items={DISTRICTS}
                    selectedKey={field.value}
                    renderText={_.capitalize}
                    onChangeValue={field.onChange}
                  />
                )}
              />
            </Column>
          </Section>
          {/* More about the HIV side of the patient*/}
          <Section
            title="HIV Related Information"
            desc="Asking HIV related information">
            <Column>
              <Text>Has the patient had a HIV test that was positive?</Text>
              {/* Control for Yes no inputs */}
              <Controller
                name="hasPositiveTest"
                control={control}
                render={({field}) => (
                  <>
                    <RadioButton.Group
                      value={field.value ? 'yes' : 'no'}
                      onValueChange={d => field.onChange(d === 'yes')}>
                      <View style={{flexDirection: 'row'}}>
                        <RadioButton.Item label="Yes" value="yes" />
                        <RadioButton.Item label="No" value="no" />
                      </View>
                    </RadioButton.Group>
                    {field.value && (
                      <Column spaceTop>
                        <Text>Date since known status</Text>
                        <ControlDateInput
                          name="dateOfTest"
                          control={control}
                          required={field.value}
                          dateTimeProps={{maxDate: new Date()}}
                        />
                      </Column>
                    )}
                  </>
                )}
              />
            </Column>
            <Column spaceTop>
              <Text style={{lineHeight: 20}}>
                Is the patient currently on ARVs?
              </Text>

              <Controller
                name="hasPatientOnARVs"
                control={control}
                render={({field}) => (
                  <>
                    <RadioButton.Group
                      value={field.value ? 'yes' : 'no'}
                      onValueChange={d => field.onChange(d === 'yes')}>
                      <View style={{flexDirection: 'row'}}>
                        <RadioButton.Item label="Yes" value="yes" />
                        <RadioButton.Item label="No" value="no" />
                      </View>
                    </RadioButton.Group>
                    {field.value && (
                      <Column spaceTop>
                        <Text>ARV Start Date</Text>
                        <ControlDateInput
                          name="dateOfTest"
                          control={control}
                          required={field.value}
                          dateTimeProps={{maxDate: new Date()}}
                        />
                      </Column>
                    )}
                  </>
                )}
              />
            </Column>
            <Column spaceTop>
              <Text style={{lineHeight: 20}}>
                WHO Stage at the start of ARV use?
              </Text>

              <Controller
                name="whoStage"
                control={control}
                render={({field}) => (
                  <Picker
                    label="Who Stages"
                    items={ARV_WHO_STAGES}
                    selectedKey={field.value}
                    renderText={_.capitalize}
                    onChangeValue={field.onChange}
                  />
                )}
              />
            </Column>
            <Column spaceTop>
              <Text style={{lineHeight: 20}}>
                Is the patient on a treatment support?
              </Text>

              <Controller
                name="hasTreatmentSupport"
                control={control}
                render={({field}) => (
                  <>
                    <RadioButton.Group
                      value={field.value ? 'yes' : 'no'}
                      onValueChange={d => field.onChange(d === 'yes')}>
                      <View style={{flexDirection: 'row'}}>
                        <RadioButton.Item label="Yes" value="yes" />
                        <RadioButton.Item label="No" value="no" />
                      </View>
                    </RadioButton.Group>
                    {field.value && (
                      <Controller
                        name="typeOfSupport"
                        control={control}
                        render={({field}) => (
                          <Picker
                            label="Support Type"
                            items={TYPE_O_TREATMENT_SUPPORT}
                            selectedKey={field.value}
                            renderText={_.capitalize}
                            onChangeValue={field.onChange}
                          />
                        )}
                      />
                    )}
                  </>
                )}
              />
            </Column>
          </Section>
          <Item spaceTop>
            <Button mode="contained" onPress={onSubmit} icon="pencil-outline">
              Confirm Changes
            </Button>
          </Item>
        </ScrollView>
      </Layout>
    </>
  );
}
