import { styled, useThemeProps } from '@mui/joy';
import clsx from 'clsx';
import React from 'react';
import { StepperContext } from 'fortress/Stepper';
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses';
import { getStepperUtilityClass } from './stepperClasses';
import { StepConnector } from 'fortress/StepConnector';
import { ExtendStepper, StepperProps, StepperTypeMap } from './StepperProps';

const useUtilityClasses = (ownerState: any) => {
  const { orientation, alternativeLabel, classes } = ownerState;
  const slots = {
    root: ['root', orientation, alternativeLabel && 'alternativeLabel'],
  };

  return composeClasses(slots, getStepperUtilityClass, classes);
};

const StepperRoot = styled('div', {
  name: 'MuiStepper',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, styles[ownerState.orientation], ownerState.alternativeLabel && styles.alternativeLabel];
  },
})(({ ownerState }) => ({
  display: 'flex',
  ...(ownerState.orientation === 'horizontal' && {
    flexDirection: 'row',
    alignItems: 'center',
  }),
  ...(ownerState.orientation === 'vertical' && {
    flexDirection: 'column',
  }),
  ...(ownerState.alternativeLabel && {
    alignItems: 'flex-start',
  }),
}));

const defaultConnector = <StepConnector />;

export const Stepper = React.forwardRef(function Stepper(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiStepper' });
  const {
    activeStep = 0,
    alternativeLabel = true,
    children,
    className,
    component = 'div',
    connector = defaultConnector,
    nonLinear = false,
    orientation = 'horizontal',
    ...other
  } = props;

  const ownerState = {
    ...props,
    alternativeLabel,
    orientation,
    component,
  };

  const classes = useUtilityClasses(ownerState);

  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const steps = childrenArray.map((step, index) => {
    return React.cloneElement(step, {
      index,
      last: index + 1 === childrenArray.length,
      ...step.props,
    });
  });
  const contextValue = React.useMemo(
    () => ({ activeStep, alternativeLabel, connector, nonLinear, orientation }),
    [activeStep, alternativeLabel, connector, nonLinear, orientation]
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <StepperRoot
        as={component}
        ownerState={ownerState}
        className={clsx(classes.root, className)}
        ref={ref}
        {...other}
      >
        {steps}
      </StepperRoot>
    </StepperContext.Provider>
  );
}) as ExtendStepper<StepperTypeMap>;

export default Stepper;
