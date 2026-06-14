import React, { useMemo } from 'react';
import { Select, Box, Option } from '../../../index';
import { useFormContext } from 'react-hook-form';
import { HookSelectProps } from './index';

const HookSelect: React.FC<Omit<HookSelectProps, 'subType'>> = ({
  field,
  placeholder,
  options,
  joyProps = {},
  optionJoyProps = {},
}) => {
  const { setValue } = useFormContext();
  const { onChange, onBlur, ...selectField } = field;
  const variant = useMemo(() => joyProps?.variant || 'borderplain', [joyProps]);
  const handleChange = (event: React.SyntheticEvent | null, newValue: string | null) =>
    setValue(selectField.name, newValue || '');

  return (
    // @ts-ignore
    <Select {...selectField} variant={variant} placeholder={placeholder} onChange={handleChange} {...joyProps}>
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        {options?.map(({ label, value }) => (
          // @ts-ignore
          <Option key={value} variant={variant} value={value} {...optionJoyProps}>
            {label}
          </Option>
        ))}
      </Box>
    </Select>
  );
};

export default HookSelect;
