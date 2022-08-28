import React from 'react';
import {TextInput} from 'react-native';

class TextInputMask extends React.Component {
  render() {
    return <TextInput {...this.props} />;
  }
}

const mask = (mask, value, cb) => {};
const unmask = (mask, masked, cb) => {};
const setMask = (node, mask) => {};

export {mask, unmask, setMask};
export default TextInputMask;
