import React from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';

const CheckboxOption = ({ bemBlocks, active, onClick, label, checkboxGroup }) => {
  let newLabel = label;
  if (checkboxGroup && checkboxGroup === 'tags' && typeof label === 'string' && label.includes('_')) {
    newLabel = label
      .trim()
      .split('_')
      .filter((word) => !!word)
      .map((word) => capitalize(word))
      .join(' ');
  }
  return (
    <div
      className={bemBlocks.option().state({ selected: active }).mix('checkbox-option')}
      onClick={onClick}
      role="checkbox"
      aria-checked={active}
      tabIndex="0"
    >
      <div className="input" />
      {/* <div>&#x2713;</div> */}
      <div className="text">{newLabel}</div>
    </div>
  );
};

CheckboxOption.propTypes = {
  bemBlocks: PropTypes.object,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  label: PropTypes.string,
  checkboxGroup: PropTypes.string,
};

export default CheckboxOption;
