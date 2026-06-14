/**
 * form 布局，一栏/两栏
 */
export type FormLayoutColumns = '1' | '2';
/**
 * form-blok支持的 variant 和 color
 */
export type FormBlokVariants = 'solid' | 'borderplain' | 'soft' | 'outlined';
export type FormBlokColors = 'primary' | 'neutral';
/**
 * form-blok 的 action button
 */
export type FormBlokAction = {
  text: string;
  show_captcha?: boolean /** Is robot verification required? */;
  action: {
    linktype: 'url' | '';
    fieldtype: 'multilink' | '';
    url: string;
  };
};
export type FormItemOptions = {
  list: {
    label: string;
    value: any;
  }[];
};
export type FormDateItemControls = {
  date_format: string;
  default_start_date: Date;
  before_date: Date;
  after_date: Date;
  disabled_dates: Array<{
    date_blok: Date;
  }>;
  disabled_date_range: Array<{
    start_date: Date;
    end_date: Date;
  }>;
};
/**
 * 字段校验
 */
export type FieldValidation = {
  type: string;
  validator?: string;
  error_message?: string;
};
export type FormBlokListItemProps = {
  key: string;
  required: boolean;
  label?: string;
  placeholder?: string;
};
/**
 * form 样式配置
 */
export type FormBlokStyling = {
  color: FormBlokColors;
  variant: FormBlokVariants;
  layout: FormLayoutColumns;
};

export type FormItemListParams = {
  _uid: string;
  _editable: string;
  component: string;
  props: FormBlokListItemProps[];
  rule: FieldValidation[];
  options?: FormItemOptions[];
  controls?: Array<Partial<FormDateItemControls>>;
};
