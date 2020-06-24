import React from 'react';
import Component from './component';

export default class Autocomplete extends Component {

  componentDidMount() {
    const ac = new BMap.Autocomplete({
      'input': 'suggestId',
    });

    ac.addEventListener('onconfirm', e => {
      this.props.onConfirm && this.props.onConfirm(e);
    });
  }

  render() {
    return <div>
      <input style={this.props.style} id={'suggestId'}/>
    </div>;
  }
}