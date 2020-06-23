import React, {Component} from 'react';
import {Autocomplete} from '../../../src';

export default class App extends Component {
  render() {
    return <Autocomplete confirm={(event) => console.log(event.item.value)}/>;
  }
}