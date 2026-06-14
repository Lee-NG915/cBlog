// import * as React from 'react';
// import { SxProps } from '@mui/system';
// import { StepLabelClasses } from './stepLabelClasses';
// import type { StepIconProps } from '@mui/material';
// import { Theme } from '@mui/joy';
// import { OverridableComponent, OverridableTypeMap, OverrideProps } from '@mui/material/OverridableComponent';

// export interface StepLabelProps<M extends OverridableTypeMap> {
//   /**
//    * In most cases will simply be a string containing a title for the label.
//    */
//   children?: React.ReactNode;
//   /**
//    * Override or extend the styles applied to the component.
//    */
//   classes?: Partial<StepLabelClasses>;
//   /**
//    * The props used for each slot inside.
//    * @default {}
//    */
//   componentsProps?: {
//     /**
//      * Props applied to the label element.
//      * @default {}
//      */
//     label?: React.HTMLProps<HTMLSpanElement>;
//   };
//   /**
//    * If `true`, the step is marked as failed.
//    * @default false
//    */
//   error?: boolean;
//   /**
//    * Override the default label of the step icon.
//    */
//   icon?: React.ReactNode;
//   /**
//    * The optional node to display.
//    */
//   optional?: React.ReactNode;
//   /**
//    * The props used for each slot inside.
//    * @default {}
//    */
//   slotProps?: {
//     /**
//      * Props applied to the label element.
//      * @default {}
//      */
//     label?: React.HTMLProps<HTMLSpanElement>;
//   };
//   /**
//    * The component to render in place of the [`StepIcon`](/material-ui/api/step-icon/).
//    */
//   StepIconComponent?: React.ElementType;
//   /**
//    * Props applied to the [`StepIcon`](/material-ui/api/step-icon/) element.
//    */
//   StepIconProps?: Partial<StepIconProps>;
//   /**
//    * The system prop that allows defining system overrides as well as additional CSS styles.
//    */
//   sx?: SxProps<Theme>;
// }

// export type StepLabelClasskey = keyof NonNullable<StepLabelProps['classes']>;



