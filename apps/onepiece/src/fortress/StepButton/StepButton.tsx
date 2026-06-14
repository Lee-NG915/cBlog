import * as React from 'react';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses';
import { StepperContext } from 'fortress/Stepper';
import { StepContext } from 'fortress/Step';
import { Button } from 'fortress/Button';
import { unstable_isMuiElement as isMuiElement } from '@mui/utils';

import stepButtonClasses, { getStepButtonUtilityClass } from './stepButtonClasses';
import { useThemeProps, styled } from '@mui/joy';
import { StepLabel } from 'fortress/StepLabel';
// import { Button } from 'fortress/Button';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation } = ownerState;

  const slots = {
    root: ['root', orientation],
    touchRipple: ['touchRipple'],
  };

  return composeClasses(slots, getStepButtonUtilityClass, classes);
};

const StepButtonRoot = styled(Button, {
  name: 'MuiStepButton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      { [`& .${stepButtonClasses.touchRipple}`]: styles.touchRipple },
      styles.root,
      styles[ownerState.orientation],
    ];
  },
})(({ ownerState }) => ({
  width: '100%',
  padding: '24px 16px',
  margin: '-24px -16px',
  boxSizing: 'content-box',
  ...(ownerState.orientation === 'vertical' && {
    justifyContent: 'flex-start',
    padding: '8px',
    margin: '-8px',
  }),
  [`& .${stepButtonClasses.touchRipple}`]: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
}));

export const StepButton = React.forwardRef(function StepButton(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiStepButton' });
  const { children, className, icon, optional, onClick = () => {}, ...other } = props;

  const { disabled, active, completed } = React.useContext(StepContext);
  const { orientation } = React.useContext(StepperContext);

  const ownerState = { ...props, orientation };

  const classes = useUtilityClasses(ownerState);

  const childProps = {
    icon,
    optional,
  };

  const child = isMuiElement(children, ['StepLabel']) ? (
    React.cloneElement(children, childProps)
  ) : (
    <StepLabel {...childProps}>{children}</StepLabel>
  );

  return (
    <StepButtonRoot
      focusRipple
      disabled={disabled}
      TouchRippleProps={{ className: classes.touchRipple }}
      className={clsx(classes.root, className)}
      ref={ref}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick(event, { active, disabled, completed });
      }}
      ownerState={ownerState}
      aria-current={active ? 'step' : undefined}
      variant="tertiary"
      {...other}
    >
      {child}
    </StepButtonRoot>
  );
});

export default StepButton;
