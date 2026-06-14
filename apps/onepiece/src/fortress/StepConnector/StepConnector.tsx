import * as React from 'react';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses';
import { StepperContext } from 'fortress/Stepper';
import { StepContext } from 'fortress/Step';
import { getStepConnectorUtilityClass } from './stepConnectorClasses';
import { unstable_capitalize as capitalize } from '@mui/utils';
import { styled, useThemeProps } from '@mui/joy';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, alternativeLabel, active, completed, disabled } = ownerState;

  const slots = {
    root: [
      'root',
      orientation,
      alternativeLabel && 'alternativeLabel',
      active && 'active',
      completed && 'completed',
      disabled && 'disabled',
    ],
    line: ['line', `line${capitalize(orientation)}`],
  };

  return composeClasses(slots, getStepConnectorUtilityClass, classes);
};

const StepConnectorRoot = styled('div', {
  name: 'MuiStepConnector',
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
})(({ theme, ownerState }) => ({
  flex: '1 1 auto',
  ...(ownerState.orientation === 'vertical' && {
    marginLeft: 16, // half icon
  }),
  ...(ownerState.alternativeLabel && {
    position: 'absolute',
    // 线条的位置
    top: 12,
    left: 'calc(-50% + 12px)',
    right: 'calc(50% + 12px)',
    [theme.breakpoints.up('sm')]: {
      top: 16,
      left: 'calc(-50% + 16px)',
      right: 'calc(50% + 16px)',
    },
  }),
}));

const StepConnectorLine = styled('span', {
  name: 'MuiStepConnector',
  slot: 'Line',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.line, styles[`line${capitalize(ownerState.orientation)}`]];
  },
})(({ ownerState, theme }) => {
  const borderColor = theme.palette.mode === 'light' ? theme.palette.neutral[500] : theme.palette.neutral[600];
  const activeBorderColor = theme.palette.mode === 'light' ? theme.palette.primary[500] : theme.palette.primary[600];
  return {
    display: 'block',
    borderColor: theme?.vars?.palette?.StepConnector?.border || borderColor,
    ...(ownerState.orientation === 'horizontal' && {
      borderTopStyle: 'solid',
      borderTopWidth: 1,
    }),
    ...((ownerState.active || ownerState.completed) && {
      borderColor: activeBorderColor,
    }),
    ...(ownerState.orientation === 'vertical' && {
      borderLeftStyle: 'solid',
      borderLeftWidth: 1,
      minHeight: 24,
    }),
  };
});
// TODO StepConnectorProps.tsx
export const StepConnector = React.forwardRef(function StepConnector(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiStepConnector' });
  const { className, ...other } = props;

  const { alternativeLabel, orientation = 'horizontal' } = React.useContext(StepperContext);
  const { active, disabled, completed } = React.useContext(StepContext);

  const ownerState = { ...props, alternativeLabel, orientation, active, completed, disabled };
  const classes = useUtilityClasses(ownerState);

  return (
    <StepConnectorRoot className={clsx(classes.root, className)} ref={ref} ownerState={ownerState} {...other}>
      <StepConnectorLine className={classes.line} ownerState={ownerState} />
    </StepConnectorRoot>
  );
});

export default StepConnector;
