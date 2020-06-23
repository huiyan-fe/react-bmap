import React, {Component} from 'react';
import {Autocomplete} from '../../../src';

export default class App extends Component {
  render() {
    return <Autocomplete style={{margin: '10px 0'}}
                         confirm={(event) => console.log(event.item.value)}/>;
  }
}