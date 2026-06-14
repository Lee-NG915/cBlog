import React, { useMemo } from 'react';
import { Select, Option } from 'fortress';
import { useFormContext } from 'react-hook-form';
import type { HookSelectProps } from './index';

const MultipleSelect: React.FC<Omit<HookSelectProps, 'subType'>> = ({
  field,
  placeholder,
  options,
  joyProps = {},
  optionJoyProps = {},
}) => {
  const { setValue } = useFormContext();
  const { name, value } = field || {};
  const variant = useMemo(() => joyProps?.variant || 'borderplain', [joyProps]);
  const realValue = React.useMemo(() => (Array.isArray(value) ? value : [value]), [value]);
  const handleChange = (event: React.SyntheticEvent | null, newValue: string | null) => setValue(name, newValue || []);

  return (
    <Select
      name={name}
      value={realValue}
      multiple
      variant={variant}
      placeholder={placeholder}
      onChange={handleChange}
      {...joyProps}
    >
      {options?.map(({ label, value }) => (
        // @ts-ignore
        <Option key={value} variant={variant} value={value} {...optionJoyProps}>
          {label}
        </Option>
      ))}
    </Select>
  );
};

export default MultipleSelect;
