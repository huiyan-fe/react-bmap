import React from 'react';
import Component from './component';

export default class Autocomplete extends Component {

  componentDidMount() {
    const ac = new BMap.Autocomplete({
      'input': 'suggestId',
    });

    ac.addEventListener('onconfirm', e => {
      this.props.confirm && this.props.confirm(e);
    });
  }

  render() {
    return <div>
      <input id={'suggestId'}/>
    </div>;
  }
}