import React from 'react';
import {
  HookInput,
  type HookInputComponent,
  HookSelect,
  type HookSelectComponent,
  HookDatePicker,
  type HookDatePickerComponent,
  HookCheckbox,
  type HookCheckboxComponent,
} from '../index';
import { Type } from '../types';

interface EmptyOwnProps {}
const Empty: React.FC<EmptyOwnProps> = ({}) => <React.Fragment>[Check : No Component Matched]</React.Fragment>;

type SliceComponent<T> = T extends 'input'
  ? HookInputComponent
  : T extends 'select'
  ? HookSelectComponent
  : T extends 'datePicker'
  ? HookDatePickerComponent
  : T extends 'checkbox'
  ? HookCheckboxComponent
  : any;

const sliceMap: Map<Type, SliceComponent<Type>> = new Map();
sliceMap.set('input', HookInput);
sliceMap.set('select', HookSelect);
sliceMap.set('datePicker', HookDatePicker);
sliceMap.set('checkbox', HookCheckbox);

const useSliceMap = (type: Type) => sliceMap.get(type) || Empty;
export default useSliceMap;
