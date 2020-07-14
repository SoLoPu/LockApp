import React from 'react';
import { } from 'react-native';
import Index from './Components/Index';
import {decode, encode} from 'base-64'
import { YellowBox } from 'react-native';
import _ from 'lodash';

YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

if (!global.btoa) {  global.btoa = encode }

if (!global.atob) { global.atob = decode }

export default function App() {
  return (
    <Index />
  );
}
