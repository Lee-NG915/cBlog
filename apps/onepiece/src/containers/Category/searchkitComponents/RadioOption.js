import React from 'react';
import PropTypes from 'prop-types';

const RadioOptions = ({ bemBlocks, active, onClick, label }) => (
  <div role="button" className={bemBlocks.option().state({ selected: active }).mix('radio-option')} onClick={onClick}>
    <div className="input" />
    <div className="text">{label}</div>
  </div>
);

RadioOptions.propTypes = {
  bemBlocks: PropTypes.object,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  label: PropTypes.string,
};

export default RadioOptions;
