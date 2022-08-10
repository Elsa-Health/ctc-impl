import React from 'react';
import {Chip, Modal, Portal, TouchableRipple} from 'react-native-paper';
import {Text} from '@elsa-ui/react-native/components';
import {View} from 'react-native';
import {Row} from '../temp-components';

const CTCOptionsAvailable = Object.entries({
  'Meru District Hospital': '02020100',
  'Mbuguni CTC': '02020101',
  'Usa Dream': '02020250',
  'Nkoaranga Lutheran Hospital': '02020300',
  'Usa Government': '02020500',
  Momela: '02020118',
  Makiba: '02020105',
  'Ngarenanyuki Health Centre': '02020103',
  Mareu: '02020120',
  'Other - Not Registered': '',
});

export const PatientQuery = function ({children, myCtcId, onChange, onFocus}) {
  const [showSelectionModal, setShow] = React.useState(false);

  return (
    <>
      <Portal>
        <Modal
          visible={showSelectionModal}
          onDismiss={() => setShow(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: 36,
          }}>
          <View>
            <View style={{paddingHorizontal: 16, paddingVertical: 12}}>
              <Text font="bold" size={'lg'}>
                Select CTC
              </Text>
            </View>
            <View>
              {CTCOptionsAvailable.map(([name, ctc], ix) => (
                <TouchableRipple
                  key={ix}
                  onPress={() => {
                    setShow(false);
                    onChange?.(ctc);
                    onFocus?.();
                  }}>
                  <View
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                    }}>
                    <Text size={16} style={{marginBottom: 4, letterSpacing: 1}}>
                      {name}
                    </Text>
                    <Text
                      font="medium"
                      size={16}
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}>
                      {ctc}
                    </Text>
                  </View>
                </TouchableRipple>
              ))}
            </View>
          </View>
        </Modal>
      </Portal>
      <View>
        {children}
        <Row contentStyle={{justifyContent: 'flex-start'}} spaceTop spaceBottom>
          {myCtcId !== undefined && (
            <Chip
              icon="home"
              onPress={() => {
                onChange(myCtcId);
                onFocus?.();
              }}
              style={{marginRight: 4}}>
              My facility
            </Chip>
          )}
          <Chip icon="information" onPress={() => setShow(true)}>
            Select Facility
          </Chip>
        </Row>
      </View>
    </>
  );
};
