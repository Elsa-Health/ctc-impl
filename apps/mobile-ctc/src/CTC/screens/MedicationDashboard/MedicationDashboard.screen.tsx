import React from 'react';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Layout, Text} from '@elsa-ui/react-native/components';
import {useTheme} from '@elsa-ui/react-native/theme';
import {ScrollView, View} from 'react-native';
import {
  Column,
  Item,
  Row,
  Section,
  TitledItem,
  TouchableItem,
} from '../../temp-components';
import {WorkflowScreenProps} from '@elsa-ui/react-native-workflows';
import {Button} from 'react-native-paper';
import {List} from 'immutable';

import {format, formatDistanceToNow} from 'date-fns';
import _ from 'lodash';

import {ctc} from '@elsa-health/emr';
import {useWorkflowApi, useWorkflowStore} from '../../workflow';
import {FlashList} from '@shopify/flash-list';

type ScreenProps = WorkflowScreenProps<
  {},
  {
    onShowAllMedicationDispenses: () => void;
    onShowMedicationRequest: (medicationRequest: MedicaReq) => void;
    getMedicationRequests: () => Promise<MedicaReq[]>;
    getPatientsToRequestFor: () => Promise<Array<{id: string; name: string}>>;
    getMedicationDispenseFrom: (
      medicationRequest: MedicaReq,
    ) => Promise<MedicaDisp | null>;
  }
>;

const prepareAvailableMedicationRequests = (
  requests: List<ctc.MedicationRequest>,
  $: ScreenProps['actions'],
) => {
  //
  if (requests === undefined) {
    return [];
  }

  // console.log(requests.count());

  return requests
    .map((req, ix) => {
      // console.log(req.medication);
      // if (req.medication.resourceType !== 'ResourceItem') {
      //   return null;
      // }

      // dealing only with medication requests for ARVs
      // NOTE: might want to remove this handler later on.
      if (req.medication.category !== 'arv-ctc') {
        return null;
      }

      // console.log('HRE!');
      const medicationText = req.medication.text;
      const medicationId = req.medication.identifier;

      return {
        data: {
          actualRequestTime: new Date(req.authoredOn),
          reqTime: formatDistanceToNow(new Date(req.authoredOn)),
          subject: req.subject.id,
          requestedBy: req.requester?.id,
          type: req.medication.form,
          requestId: req.id,
          medicationText,
          _full: req,
        },

        // handlers for what to do next
        loadMedicationDispense: () => $.getMedicationDispenseFrom(req),
        onViewRequest: () => $.onShowMedicationRequest(req),
      };
    })
    .filter(d => d !== null)
    .sortBy(d => -d.data.actualRequestTime.getTime())
    .toArray();
};

function MedicationDashboardScreen({actions: $}: ScreenProps) {
  const api = useWorkflowApi();
  const {spacing, color} = useTheme();
  // const {
  //   value: medicaRequests,
  //   retry,
  //   loading,
  // } = useAsyncRetry<List<MedicaReq>>(async () => {
  //   return List((await $.getMedicationRequests?.()) || []);
  // });

  const [requests, set] = React.useState(
    prepareAvailableMedicationRequests(api.getState().value['med.requests'], $),
  );

  React.useEffect(() => {
    const unsubscribe = api.subscribe(x => {
      set(prepareAvailableMedicationRequests(x.value['med.requests'], $));
    });

    return () => unsubscribe();
  }, [$]);
  // const {BottomModal: RequestBottomModal, presentModal: showRequestModal} =
  //   useBottomModal();

  return (
    <Layout title="Medications" style={{padding: 0}}>
      <ScrollView
        contentContainerStyle={{paddingHorizontal: spacing.md}}
        style={{flex: 1}}>
        {/* <Section mode="raised" desc="Potential Problem!">
          <Text>Medication stock might be low ?</Text>
        </Section> */}
        {/* Actions to do here */}
        <Section title="Get Started" removeLine desc="Things that can be done">
          <TouchableItem
            spaceTop
            style={{backgroundColor: '#FFF'}}
            onPress={$.onShowAllMedicationDispenses}>
            <Row icon="file-document-multiple-outline">
              <Text font="medium" size={17} style={{letterSpacing: 1}}>
                View responded requests
              </Text>
              <Icon name="arrow-right" color={color.primary.base} size={24} />
            </Row>
          </TouchableItem>
        </Section>
        {/* Medication Requests */}
        <Section
          title="Meds. Request"
          desc="Request for medications"
          removeLine>
          {requests.length === 0 ? (
            <Column contentStyle={{alignItems: 'center'}}>
              <Text italic>No requests that have been created.</Text>
            </Column>
          ) : (
            <>
              <FlashList
                estimatedItemSize={60}
                data={requests}
                renderItem={({item: d, index: ix}) => (
                  <Item
                    spaceTop={ix !== 0}
                    style={{minHeight: 58, width: '100%'}}>
                    <MedicationRequestItem {...d} />
                  </Item>
                )}
              />
            </>
          )}
        </Section>
      </ScrollView>
    </Layout>
  );
}
type Out = ReturnType<typeof prepareAvailableMedicationRequests>[0];
const singleMRqDispenseCheck = (
  data: Out['data'],
  requests: List<ctc.MedicationRequest> | undefined,
  dispenses: List<ctc.MedicationDispense> | undefined,
) => {
  if (requests === undefined || dispenses === undefined) {
    return {status: 'loading', dispenseNotice: null};
  }
  // check the stock status
  const dispenseNotice = dispenses.find(
    dsp => dsp.authorizingRequest.id === data.requestId,
  );

  if (dispenseNotice !== undefined) {
    return {
      status: 'fullfilled',
      dispenseNotice,
    };
  }

  return {
    status: 'unfullfilled',
    dispenseNotice: null,
  };
};

function MedicationRequestItem({data: d, onViewRequest}: Out) {
  const api = useWorkflowApi();
  const [status, set] = React.useState<
    | {status: 'loading' | 'unfullfilled'; dispenseNotice: null}
    | {status: 'fullfilled'; dispenseNotice: ctc.MedicationDispense}
  >(() =>
    singleMRqDispenseCheck(
      d,
      api.getState().value['med.requests'],
      api.getState().value['med.dispenses'],
    ),
  );

  React.useEffect(() => {
    const unsub = api.subscribe(x => {
      set(
        singleMRqDispenseCheck(
          d,
          x.value['med.requests'],
          x.value['med.dispenses'],
        ),
      );
    });

    return () => unsub();
  }, [set, d]);

  return (
    <Column
      wrapperStyle={{
        borderColor: '#b5c1df',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
      }}>
      <Text>
        {_.capitalize(d?.type)} Meds:{' '}
        <Text font="bold">{d?.medicationText}</Text>
      </Text>
      <Text>
        For patient: <Text font="bold">{d?.subject}</Text>
      </Text>
      <Text italic size={14}>
        Request made {d?.reqTime} ago
      </Text>
      <View>
        {/* <AsyncComponent loader={loadMedicationDispense}>
          {({loading, error, value}) => { */}
        {status.status === 'loading' ? (
          <View>
            <Text>Checking for Results...</Text>
          </View>
        ) : status.status === 'fullfilled' ? (
          <View>
            <TitledItem title="Status" spaceTop>
              Dispense Notice
              <Icon name="check" color="green" size={20} />
            </TitledItem>
            {status.dispenseNotice?.createdAt && (
              <TitledItem title="Date Dispensed" spaceTop>
                {format(
                  new Date(status.dispenseNotice.createdAt),
                  'yyyy, MMMM dd',
                )}
              </TitledItem>
            )}
          </View>
        ) : (
          <Column spaceTop>
            <Button onPress={onViewRequest}>View Request</Button>
          </Column>
        )}

        {/* }}
        </AsyncComponent> */}
      </View>
    </Column>
  );
}

// function RequestMedicationForm(props: {
//   onCancel?: () => void;
//   onRequest: (props: MakeRequestHandlerProps) => void;
// }) {
//   const [type, setType] = React.useState<'arv' | 'standard'>('arv');
//   const [arvClass, setARVClass] = React.useState<ARV.Class | null>(null);
//   const [arvRegimen, setArvRegimen] = React.useState<ARV.Regimen | null>(null);
//   const [medi, setMedi] = React.useState<Medication.All | null>(null);

//   const [patient, setPatient] = React.useState<string>();
//   const [reason, setReason] = React.useState<string>();

//   const handleRequest = () => {
//     if (patient === null) {
//       return;
//     }

//     if (type === 'arv' && arvClass === null && arvRegimen === null) {
//       return;
//     }

//     if (type === 'standard' && medi === null) {
//       return;
//     }

//     // ...
//     if (type === 'arv') {
//       props.onRequest({
//         type,
//         patientId: patient,
//         regimen: arvRegimen,
//         className: arvClass,
//         reason: reason ?? null,
//       });
//     } else {
//       if (type === 'standard') {
//         props.onRequest({
//           type,
//           medication: medi,
//           reason: reason ?? null,
//           patientId: patient,
//         });
//       } else {
//         return;
//       }
//     }
//   };
//   return (
//     <>
//       <View style={{padding: 16}}>
//         <Section
//           title="Medication Details"
//           desc="Information higlighting medication information">
//           <Column>
//             <Text>Type of medicine?</Text>
//             <RadioButton.Group value={type} onValueChange={setType}>
//               <View style={{flexDirection: 'row'}}>
//                 <RadioButton.Item label="ARV" value="arv" />
//                 <RadioButton.Item label="Standard" value="standard" />
//               </View>
//             </RadioButton.Group>
//           </Column>
//           {/* Medication to choose */}
//           {type === 'standard' ? (
//             <Column>
//               <Text>Select a medication</Text>
//               <MultiSelect
//                 confirmText={'Select'}
//                 items={[
//                   {
//                     name: 'Standard Medication',
//                     id: 1,
//                     children: Medication.all
//                       .pairs()
//                       .map(([id, name]) => ({id, name})),
//                   },
//                 ]}
//                 single
//                 searchPlaceholderText={'Search a standard medication'}
//                 selectText={'Select if any'}
//                 uniqueKey="id"
//                 onSelectedItemsChange={(d: Medication.All[]) => {
//                   const single = d[0];
//                   setMedi(single);
//                 }}
//                 selectedItems={medi ? [medi] : []}
//               />
//             </Column>
//           ) : (
//             <>
//               <Column>
//                 <Text>Choose ARV Class</Text>
//                 <MultiSelect
//                   confirmText={'Select'}
//                   items={[
//                     {
//                       name: 'Class',
//                       id: 1,
//                       children: ARV.class
//                         .pairs()
//                         .map(([id, name]) => ({id, name})),
//                     },
//                   ]}
//                   single
//                   searchPlaceholderText={'Search for class'}
//                   selectText={'No class selected'}
//                   uniqueKey="id"
//                   onSelectedItemsChange={(d: ARV.Class[]) => {
//                     const single = d[0];
//                     setARVClass(single);
//                   }}
//                   selectedItems={arvClass !== null ? [arvClass] : []}
//                 />
//               </Column>

//               {arvClass !== null && (
//                 <Column>
//                   <Text>Choose Regimen</Text>
//                   <MultiSelect
//                     confirmText={'Select'}
//                     items={[
//                       {
//                         name: 'Class',
//                         id: 1,
//                         children: ARV.fromKey(arvClass).map(id => ({
//                           id: id,
//                           name: ARV.regimen.fromKey(id),
//                         })),
//                       },
//                     ]}
//                     single
//                     searchPlaceholderText={'Search for Regimen'}
//                     selectText={'No regimen Selected'}
//                     uniqueKey="id"
//                     onSelectedItemsChange={(d: ARV.Regimen[]) => {
//                       const single = d[0];
//                       setArvRegimen(d[0]);
//                     }}
//                     selectedItems={arvRegimen !== undefined ? [arvRegimen] : []}
//                   />
//                 </Column>
//               )}
//             </>
//           )}
//         </Section>
//         <Section
//           title="Other Details"
//           desc="Identify other helpful informatino">
//           {/* Select patient  */}
//           <Text>Choose a patient</Text>
//           <MultiSelect
//             confirmText={'Select'}
//             items={[
//               {
//                 name: 'My patients',
//                 id: 0,
//                 children: ['11111111111111'].map(id => ({id, name: id})), // [{id: '11111111111111', name: 'Test Patient'}],
//               },
//               {
//                 name: 'Other Patients',
//                 id: 1,
//                 children: ['0XXXXXXX123456'].map(id => ({id, name: id})), //  [{id: '0XXXXXXX123456', name: 'Test Patient'}],
//               },
//             ]}
//             single
//             searchPlaceholderText={'Search a patient'}
//             selectText={'None'}
//             uniqueKey="id"
//             onSelectedItemsChange={(d: Medication.All[]) => {
//               const single = d[0];
//               setPatient(single);
//             }}
//             selectedItems={patient ? [patient] : []}
//           />
//           <Item spaceTop spaceBottom>
//             <TextInput
//               label="Reason this medication"
//               value={reason}
//               onChangeText={setReason}
//               mode="outlined"
//             />
//           </Item>
//         </Section>

//         <Section>
//           <Row>
//             <Button style={{flex: 1}} onPress={props.onCancel}>
//               Cancel
//             </Button>
//             <Button
//               mode="contained"
//               style={{flex: 1.5}}
//               onPress={handleRequest}>
//               Request
//             </Button>
//           </Row>
//         </Section>
//       </View>
//     </>
//   );
// }

export default function (props: ScreenProps) {
  return <MedicationDashboardScreen {...props} />;
}
