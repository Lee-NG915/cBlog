/* eslint-disable @typescript-eslint/ban-types */
import { FiledReturns } from './index';

/**
 * form values , { key:value }
 */
export type TFormValues = {
  [keyName: string]: any;
};

/**
 * type of form component,eg: 'input','select','datepicker'
 */
export type Type = 'input' | 'select' | 'datePicker' | 'checkbox';

/** input own props */
export type InputOwnProps = {
  subType: 'text' | 'number' | 'email' | 'password' | 'tel';
  /**
   * props of IMaskInput
   * @see https://imask.js.org/
   * @see https://github.com/uNmAnNeR/imaskjs/tree/master?tab=readme-ov-file
   */
  imaskProps?: Record<string, any>;
};

/** select own props */
export type SelectOwnProps = {
  /** the specific type of select component, single selection/multiple selections possible */
  subType: 'single' | 'multiple';
  options: {
    value: any;
    label: string;
  }[];
  optionJoyProps?: {} /** JoyUIProps of select>option */;
};

export type RangeModifier = Array<{
  start: Date;
  end: Date;
}>;
export type DateModifiers = {
  before: Date;
  after: Date;
  range: RangeModifier;
};
/** datepicker own props */
export type DatePickerOwnProps = {
  /**
   * the specific type of date picker, only display date, display date and time, only display month/year, only display year + month
   */
  subType: 'date' | 'dateTime' | 'month' | 'year' | 'yearMonth';
  disabledWeekends?: boolean;
  /**
   * Set defaultStartYear so that when the calendar is opened, it will be displayed according to the start year we set
   * Combined with the yearItemNumber field, we can set the default year range displayed when the calendar is expanded.
   * eg:
   * When we want to set the calendar to display 1986 - 2005 by default when it is expanded,
   * we can set defaultStartYear: 1986, yearItemNumber: 20,
   */
  yearItemNumber?: number /** the year calendar component in datepicker defaults to the number of years displayed at one time.  */;
  //禁用一段时间
  disabledDateIntervals?: Partial<DateModifiers>;
  /** determine whether the date is prohibited from being selected */
  disabledDates?: Array<Date>;
  defaultStartDate?: Date /** Used to set the default date displayed when the calendar picker is opened when no date is selected. */;
  calendarHeaderTitle?: string;
  calendarHeaderDesc?: string;
  CalendarFooter?: React.ReactNode;
};

/** checkbox own props */
export type CheckboxOwnProps = {
  /** The specific type of checkbox component, including single-checkbox and checkbox-group */
  subType: 'checkbox' | 'group';
  options?: { value: string | number; label: string }[];
  optionJoyProps?: JoyUIProps;
};

/**
 * parameters passed to @mui/joy
 * https://mui.com/joy-ui/getting-started/
 */
export type JoyUIProps = {
  variant?: string;
  color?: string;
  sx?: Record<string, any>;
  slotProps?: Record<string, any>;
  forceType?: string;
};

/**
 * Common props for Form-Child-Component
 */
export type CommonSliceComponentProps = {
  field: FiledReturns;
  placeholder: string;
  joyProps: JoyUIProps;
};

/**
 * Common fields for Form-Child-Data
 */
export type CommonSliceFields = {
  key: string /** The keyName of the form sub-item is used for the registration form. eg: <input name={key} /> */;
  type: Type /** main type of slice-component */;
  placeholder?: string;
  label?: string;
  insertReactNode?: () => React.ReactNode /** insert components before the item, such as form subtitles, etc. */;
  appendReactNode?: () => React.ReactNode /** insert components after the item, such as form subtitles, etc. */;
  show?: (values: TFormValues) => boolean /** determine whether to display the item based on the values of the form */;
  sliceWrapperJoyProps?: {} /** JoyUIProps of the wrapper of slice-component */;
  joyProps?: JoyUIProps /** JoyUIProps of the slice-component */;
};

export type SliceFormDataByType<T extends Type> = T extends 'input'
  ? CommonSliceFields & InputOwnProps
  : T extends 'select'
  ? CommonSliceFields & SelectOwnProps
  : T extends 'datePicker'
  ? CommonSliceFields & DatePickerOwnProps
  : T extends 'checkbox'
  ? CommonSliceFields & CheckboxOwnProps
  : never;

export type SliceFormItemData = SliceFormDataByType<Type>;
export type FormData = Array<SliceFormItemData>;

/**
 * submit handler
 * @params data
 * @returns
 */
export interface onSubmitFunc {
  <T extends TFormValues>(data: T): void;
}

/**
 * default value for Form
 * Object or Promise
 */
export type DefaultFetcher = TFormValues | (() => Promise<TFormValues>);
