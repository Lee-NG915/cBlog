'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses';
import { Avatar, SvgIcon, styled, useThemeProps } from '@mui/joy';
// import CheckCircle from '../internal/svg-icons/CheckCircle';
// import Warning from '../internal/svg-icons/Warning';
// import SvgIcon from '../SvgIcon';
// import { Warning, CheckCircle } from 'fortress/Icons';
import stepIconClasses, { getStepIconUtilityClass } from './stepIconClasses';
import useBreakpoints from 'fortress/hooks/useBreakpoints/useBreakpoints';

const useUtilityClasses = (ownerState) => {
  const { classes, active, completed, error } = ownerState;

  const slots = {
    root: ['root', active && 'active', completed && 'completed', error && 'error'],
    text: ['text'],
  };

  return composeClasses(slots, getStepIconUtilityClass, classes);
};

const StepIconRoot = styled(Avatar, {
  name: 'MuiStepIcon',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  // display: 'block',
  // transition: theme.transitions.create('color', {
  //   duration: theme.transitions.duration.shortest,
  // }),
  // color: (theme.vars || theme).palette.background.surface,
  // [`&.${stepIconClasses.completed}`]: {
  //   color: (theme.vars || theme).palette.primary[500],
  // },
  // [`&.${stepIconClasses.active}`]: {
  //   color: (theme.vars || theme).palette.primary[500],
  // },
  // [`&.${stepIconClasses.error}`]: {
  //   color: (theme.vars || theme).palette.danger[500],
  // },
}));

// const StepIconText = styled('text', {
//   name: 'MuiStepIcon',
//   slot: 'Text',
//   overridesResolver: (props, styles) => styles.text,
// })(({ theme, ownerState }) => {
//   console.log('🚀 ~ file: StepIcon.js:50 ~ ownerState:', ownerState);
//   return {
//     // 圆圈里文字的颜色
//     // fill: (theme.vars || theme).palette.text.secondary,
//     fontFamily: (theme.vars || theme).fontFamily.display,
//     fontSize: (theme.vars || theme).fontSize.lg,
//     fontWeight: (theme.vars || theme).fontWeight.md,
//     lineHeight: (theme.vars || theme).lineHeight.md,

//     // fontSize: theme.typography.h2.fontSize,
//   };
// });
// TODO StepIconPorps.tsx
export const StepIcon = React.forwardRef(function StepIcon(inProps, ref) {
  let { desktop, mobile } = useBreakpoints();
  const props = useThemeProps({ props: inProps, name: 'MuiStepIcon' });
  const { active = false, className: classNameProp, completed = false, error = false, icon, ...other } = props;

  const ownerState = { ...props, active, completed, error };
  const classes = useUtilityClasses(ownerState);

  if (typeof icon === 'number' || typeof icon === 'string') {
    const className = clsx(classNameProp, classes.root);

    // if (error) {
    //   return <StepIconRoot as={Warning} className={className} ref={ref} ownerState={ownerState} {...other} />;
    // }

    // if (completed) {
    //   return <StepIconRoot as={CheckCircle} className={className} ref={ref} ownerState={ownerState} {...other} />;
    // }

    return (
      <StepIconRoot
        className={className}
        ref={ref}
        ownerState={ownerState}
        size="sm"
        variant="outlined"
        sx={{
          ...(mobile && {
            '--Avatar-size': '1.5rem',
          }),
        }}
        {...((completed || active) && {
          color: 'primary',
          variant: 'solid',
        })}
        {...other}
      >
        {/* <StepIconText
          className={classes.text}
          x="12"
          y="12"
          textAnchor="middle"
          dominantBaseline="central"
          ownerState={ownerState}
        >
        </StepIconText> */}
        {icon}
      </StepIconRoot>
    );
  }

  return icon;
});

export default StepIcon;
