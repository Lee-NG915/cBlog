import * as React from 'react';
import { SxProps } from '@mui/system';
// import { OverridableComponent, OverrideProps } from '../OverridableComponent';
import { OverridableComponent, OverridableStringUnion, OverridableTypeMap, OverrideProps } from '@mui/types';
import { StepperClasses } from './stepperClasses';
import { AvatarProps, Theme } from '@mui/joy';

export type Orientation = 'horizontal' | 'vertical';

export interface StepperTypeMap<AdditionalProps = {}, DefaultComponent extends React.ElementType = 'div'> {
  props: AdditionalProps &
    AvatarProps & {
      /**
       * Set the active step (zero based index).
       * Set to -1 to disable all the steps.
       * @default 0
       */
      activeStep?: number;
      /**
       * If set to 'true' and orientation is horizontal,
       * then the step label will be positioned under the icon.
       * @default false
       */
      alternativeLabel?: boolean;
      /**
       * Two or more `<Step />` components.
       */
      children?: React.ReactNode;
      /**
       * Override or extend the styles applied to the component.
       */
      classes?: Partial<StepperClasses>;
      /**
       * An element to be placed between each step.
       * @default <StepConnector />
       */
      connector?: React.ReactElement<any, any> | null;
      /**
       * If set the `Stepper` will not assist in controlling steps for linear flow.
       * @default false
       */
      nonLinear?: boolean;
      /**
       * The component orientation (layout flow direction).
       * @default 'horizontal'
       */
      orientation?: Orientation;
      /**
       * The system prop that allows defining system overrides as well as additional CSS styles.
       */
      sx?: SxProps<Theme>;
    };
  defaultComponent: DefaultComponent;
}

export type StepperProps<
  RootComponent extends React.ElementType = StepperTypeMap['defaultComponent'],
  AdditionalProps = { component?: React.ElementType }
> = OverrideProps<StepperTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

export type StepperClasskey = keyof NonNullable<StepperProps['classes']>;

export interface ExtendStepperTypeMap<M extends OverridableTypeMap> {
  props: M['props'] & StepperProps;
  defaultComponent: M['defaultComponent'];
}

export type ExtendStepper<M extends OverridableTypeMap> = ((
  props: OverrideProps<ExtendStepperTypeMap<M>, 'div'>
) => JSX.Element) &
  OverridableComponent<ExtendStepperTypeMap<M>>;

/**
 *
 * Demos:
 *
 * - [Stepper](https://mui.com/material-ui/react-stepper/)
 *
 * API:
 *
 * - [Stepper API](https://mui.com/material-ui/api/stepper/)
 */
declare const Stepper: OverridableComponent<StepperTypeMap>;

export default Stepper;
