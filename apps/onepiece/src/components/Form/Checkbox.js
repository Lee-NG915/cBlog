import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import style from './style.scss';

class Checkbox extends Component {
  static propTypes = {
    label: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    ...formsyTypes,
  };

  static defaultProps = {
    disabled: false,
  };

  onClick = () => {
    const { value, setValue } = this.props;
    setValue(!value);
  };

  render() {
    const { id, label, value, disabled } = this.props;

    return (
      <div className={style.checkbox}>
        <input id={id || 'Checkbox'} type="checkbox" disabled={disabled} checked={value} onChange={this.onClick} />
        <label htmlFor={id || 'Checkbox'} dangerouslySetInnerHTML={{ __html: label }} />
      </div>
    );
  }
}

export default withFormsy(Checkbox);
