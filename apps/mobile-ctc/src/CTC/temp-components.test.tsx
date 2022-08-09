import {render} from '@testing-library/react-native';
import React from 'react';
import {
  Block,
  CollapsibleSection,
  Column,
  ControlDateInput,
  Item,
  MultiSelect,
  Row,
  Section,
  SimpleDate,
  TitledItem,
  TouchableItem,
} from './temp-components';

describe('Temporary Components', () => {
  test('<Column />', () => {
    // ...
    render(
      <Column>
        <></>
      </Column>,
    );
  });
  test('<Row />', () => {
    // ...
    render(
      <Row>
        <></>
      </Row>,
    );
  });
  test('<Block />', () => {
    // ...
    render(
      <Block>
        <></>
      </Block>,
    );
  });
  test('<SimpleDate />', () => {
    // ...
    render(<SimpleDate />);
  });
  test('iconToggle', () => {
    // ...
  });
  test('<MultiSelect />', () => {
    // ...
    render(<MultiSelect />);
  });
  test('<TouchableItem />', () => {
    // ...
    render(
      <TouchableItem>
        <></>
      </TouchableItem>,
    );
  });
  test('<Item />', () => {
    // ...
    render(
      <Item>
        <></>
      </Item>,
    );
  });
  test('<AsyncComponent />', () => {
    // ...
  });
  test('<TitledItem />', () => {
    // ...
    render(
      <TitledItem>
        <></>
      </TitledItem>,
    );
  });
  test('<CollapsibleSection />', () => {
    // ...
    render(
      <CollapsibleSection>
        <></>
      </CollapsibleSection>,
    );
  });
  test('<Section />', () => {
    // ...
    render(
      <Section>
        <></>
      </Section>,
    );
  });
  test('<ControlDateInput />', () => {
    // ...
    render(<ControlDateInput />);
  });
});
