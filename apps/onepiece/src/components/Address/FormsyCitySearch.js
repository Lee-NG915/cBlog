import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import classNames from 'classnames';
import CitySearch from './CitySearch';
import style from './style.scss';

class FormsyCitySearch extends Component {
  static propTypes = {
    className: PropTypes.string,
    // from withFormsy
    ...formsyTypes,
  };

  change = (value) => {
    const { setValue } = this.props;

    setValue(value);
  };

  render() {
    const { value, showError, errorMessage, isFormSubmitted, className } = this.props;

    return (
      <div
        className={classNames(`${style.address}__citySearch`, className, {
          'has-error': isFormSubmitted && showError,
        })}
      >
        <CitySearch
          className={`${style.address}__citySearch__autosuggest`}
          onChange={this.change}
          onSelect={this.change}
          value={value}
        />
        {isFormSubmitted && showError && <div className={`${style.address}__citySearch__error`}>{errorMessage}</div>}
      </div>
    );
  }
}

export default withFormsy(FormsyCitySearch);
