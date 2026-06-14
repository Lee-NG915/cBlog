import React, { useMemo } from 'react';
import { Select, Option } from 'fortress';
import { useFormContext } from 'react-hook-form';
import omit from 'lodash/omit';
import { HookSelectProps } from './index';

const HookSelect: React.FC<Omit<HookSelectProps, 'subType'>> = ({
  field,
  placeholder,
  options,
  joyProps = {},
  optionJoyProps = {},
}) => {
  const { setValue } = useFormContext();
  const selectField = useMemo(() => omit(field, ['onChange', 'onBlur']), [field]);
  const variant = useMemo(() => joyProps?.variant || 'borderplain', [joyProps]);
  const handleChange = (event: React.SyntheticEvent | null, newValue: string | null) =>
    setValue(selectField.name, newValue || '');

  return (
    <Select {...selectField} variant={variant} placeholder={placeholder} onChange={handleChange} {...joyProps}>
      {options?.map(({ label, value }) => (
        // @ts-ignore
        <Option key={value} variant={variant} value={value} {...optionJoyProps}>
          {label}
        </Option>
      ))}
    </Select>
  );
};

export default HookSelect;
