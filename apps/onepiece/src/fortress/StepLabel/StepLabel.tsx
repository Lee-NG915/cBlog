'use client';
import * as React from 'react';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses';
import { StepIcon } from '../StepIcon';
import stepLabelClasses, { getStepLabelUtilityClass } from './stepLabelClasses';
import { styled, useThemeProps } from '@mui/joy';
import { StepperContext } from 'fortress/Stepper';
import { StepContext } from 'fortress/Step';
// import { StepLabelProps } from './StepLabelProps';

const useUtilityClasses = (ownerState) => {
  const { classes, orientation, active, completed, error, disabled, alternativeLabel } = ownerState;

  const slots = {
    root: ['root', orientation, error && 'error', disabled && 'disabled', alternativeLabel && 'alternativeLabel'],
    label: [
      'label',
      active && 'active',
      completed && 'completed',
      error && 'error',
      disabled && 'disabled',
      alternativeLabel && 'alternativeLabel',
    ],
    iconContainer: [
      'iconContainer',
      active && 'active',
      completed && 'completed',
      error && 'error',
      disabled && 'disabled',
      alternativeLabel && 'alternativeLabel',
    ],
    labelContainer: ['labelContainer', alternativeLabel && 'alternativeLabel'],
  };

  return composeClasses(slots, getStepLabelUtilityClass, classes);
};

const StepLabelRoot = styled('span', {
  name: 'MuiStepLabel',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, styles[ownerState.orientation]];
  },
})(({ ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  [`&.${stepLabelClasses.alternativeLabel}`]: {
    flexDirection: 'column',
  },
  [`&.${stepLabelClasses.disabled}`]: {
    cursor: 'default',
  },
  ...(ownerState.orientation === 'vertical' && {
    textAlign: 'left',
    padding: '8px 0',
  }),
}));

const StepLabelLabel = styled('span', {
  name: 'MuiStepLabel',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.label,
})(({ theme, ownerState }) => ({
  ...theme.typography.h4,
  // 12px
  fontSize: theme.fontSize.xs,
  [theme.breakpoints.up('sm')]: {
    // 14px
    fontSize: theme.fontSize.sm,
  },
  // display: 'block',
  color: theme.vars?.palette.neutral[500],
  // transition: theme.transitions.create('color', {
  //   duration: theme.transitions.duration.shortest,
  // }),
  [`&.${stepLabelClasses.active}, &.${stepLabelClasses.completed}`]: {
    color: (theme.vars || theme).palette.primary[500],
  },
  [`&.${stepLabelClasses.error}`]: {
    color: (theme.vars || theme).palette.danger[500],
  },
}));

const StepLabelIconContainer = styled('span', {
  name: 'MuiStepLabel',
  slot: 'IconContainer',
  overridesResolver: (props, styles) => styles.iconContainer,
})(() => ({
  flexShrink: 0, // Fix IE11 issue
  display: 'flex',
  paddingRight: 8,
  [`&.${stepLabelClasses.alternativeLabel}`]: {
    paddingRight: 0,
  },
}));

const StepLabelLabelContainer = styled('span', {
  name: 'MuiStepLabel',
  slot: 'LabelContainer',
  overridesResolver: (props, styles) => styles.labelContainer,
})(({ theme }) => ({
  width: '100%',
  color: (theme.vars || theme).palette.text.secondary,
  [`&.${stepLabelClasses.alternativeLabel}`]: {
    textAlign: 'center',
  },
}));
// TODO StepLabelProps.tsx
export const StepLabel = React.forwardRef(function StepLabel(inProps, ref) {
  const props = useThemeProps<typeof inProps>({
    props: inProps,
    name: 'MuiStepLabel',
  });
  const {
    children,
    className,
    componentsProps = {},
    error = false,
    icon: iconProp,
    optional,
    slotProps = {},
    StepIconComponent: StepIconComponentProp,
    StepIconProps,
    ...other
  } = props;

  const { alternativeLabel, orientation } = React.useContext(StepperContext);
  const { active, disabled, completed, icon: iconContext } = React.useContext(StepContext);
  const icon = iconProp || iconContext;

  let StepIconComponent = StepIconComponentProp;

  if (icon && !StepIconComponent) {
    StepIconComponent = StepIcon;
  }

  const ownerState = {
    ...props,
    active,
    alternativeLabel,
    completed,
    disabled,
    error,
    orientation,
  };

  const classes = useUtilityClasses(ownerState);

  const labelSlotProps = slotProps.label ?? componentsProps.label;

  return (
    <StepLabelRoot className={clsx(classes.root, className)} ref={ref} ownerState={ownerState} {...other}>
      {icon || StepIconComponent ? (
        <StepLabelIconContainer className={classes.iconContainer} ownerState={ownerState}>
          <StepIconComponent completed={completed} active={active} error={error} icon={icon} {...StepIconProps} />
        </StepLabelIconContainer>
      ) : null}
      <StepLabelLabelContainer className={classes.labelContainer} ownerState={ownerState}>
        {children ? (
          <StepLabelLabel
            ownerState={ownerState}
            {...labelSlotProps}
            className={clsx(classes.label, labelSlotProps?.className)}
          >
            {children}
          </StepLabelLabel>
        ) : null}
        {optional}
      </StepLabelLabelContainer>
    </StepLabelRoot>
  );
});

StepLabel.muiName = 'StepLabel';

export default StepLabel;
