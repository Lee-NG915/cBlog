/**
 * @description A Process step for display
 * @property Steps {array<string>} Steps data
 */

import React from 'react';
import PropTypes from 'prop-types';
import style from '../style.scss';

const ProcessSteps = ({ Steps }) => (
  <div className={`${style.ProcessSteps}`}>
    {Steps.map((step, index) => (
      <div className={`${style.ProcessSteps}__step`} key={index}>
        <div className={`${style.ProcessSteps}__topSection ${style.ProcessSteps}__stepSection`} />
        <div className={`${style.ProcessSteps}__bottomSection ${style.ProcessSteps}__stepSection`} />
        <div className={`${style.ProcessSteps}__content`}>{step}</div>
      </div>
    ))}
  </div>
);
ProcessSteps.propTypes = {
  Steps: PropTypes.arrayOf(PropTypes.string),
};
ProcessSteps.defaultProps = {
  Steps: [],
};

export default ProcessSteps;
