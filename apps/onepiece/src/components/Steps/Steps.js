import React from 'react';
import Step from './components/Step';
import NumberSteps from './components/NumberSteps';

const Steps = ({ type, children, ...restProps }) => {
  const typeComponentMapping = {
    number: NumberSteps,
  };

  const StepsComponent = typeComponentMapping[type];

  return (
    <StepsComponent {...restProps} type={type}>
      {children}
    </StepsComponent>
  );
};
Steps.defaultProps = {
  className: '',
  type: 'number',
  current: 0,
  direction: 'horizontal',
  size: 'normal',
  status: 'process',
  sequence: true,
};
Steps.Step = Step;

export default Steps;
