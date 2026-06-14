import React from 'react';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses';
import { StepperContext } from 'fortress/Stepper';
import { StepContext } from 'fortress/Step';
import { getStepUtilityClass } from './stepClasses';
import { styled, useThemeProps } from '@mui/joy';
import { ExtendStep, StepTypeMap } from './StepProps';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, alternativeLabel, completed } = ownerState;

  const slots = {
    root: ['root', orientation, alternativeLabel && 'alternativeLabel', completed && 'completed'],
  };

  return composeClasses(slots, getStepUtilityClass, classes);
};

const StepRoot = styled('div', {
  name: 'MuiStep',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.orientation],
      ownerState.alternativeLabel && styles.alternativeLabel,
      ownerState.completed && styles.completed,
    ];
  },
})(({ ownerState }) => ({
  ...(ownerState.orientation === 'horizontal' && {
    paddingLeft: 8,
    paddingRight: 8,
  }),
  ...(ownerState.alternativeLabel && {
    flex: 1,
    position: 'relative',
  }),
}));

export const Step = React.forwardRef(function Step(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiStep' });
  const {
    active: activeProp,
    children,
    className,
    component = 'div',
    completed: completedProp,
    disabled: disabledProp,
    expanded = false,
    index,
    last,
    ...other
  } = props;

  const { activeStep, connector, alternativeLabel, orientation, nonLinear } = React.useContext(StepperContext);

  let [active = false, completed = false, disabled = false] = [activeProp, completedProp, disabledProp];

  if (activeStep === index) {
    active = activeProp !== undefined ? activeProp : true;
  } else if (!nonLinear && activeStep > index) {
    completed = completedProp !== undefined ? completedProp : true;
  } else if (!nonLinear && activeStep < index) {
    disabled = disabledProp !== undefined ? disabledProp : true;
  }

  const contextValue = React.useMemo(
    () => ({ index, last, expanded, icon: index + 1, active, completed, disabled }),
    [index, last, expanded, active, completed, disabled]
  );

  const ownerState = {
    ...props,
    active,
    orientation,
    alternativeLabel,
    completed,
    disabled,
    expanded,
    component,
  };

  const classes = useUtilityClasses(ownerState);

  const newChildren = (
    <StepRoot as={component} className={clsx(classes.root, className)} ref={ref} ownerState={ownerState} {...other}>
      {connector && alternativeLabel && index !== 0 ? connector : null}
      {children}
    </StepRoot>
  );

  return (
    <StepContext.Provider value={contextValue}>
      {connector && !alternativeLabel && index !== 0 ? (
        <React.Fragment>
          {connector}
          {newChildren}
        </React.Fragment>
      ) : (
        newChildren
      )}
    </StepContext.Provider>
  );
}) as ExtendStep<StepTypeMap>
export default Step;
