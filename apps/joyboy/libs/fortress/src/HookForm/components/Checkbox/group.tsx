import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, Checkbox } from '../../../index';
import { CommonSliceComponentProps, CheckboxOwnProps } from '../../types';

export type HookCheckboxGroupComponent = React.FC<CommonSliceComponentProps & CheckboxOwnProps>;

const HookCheckboxGroup: HookCheckboxGroupComponent = ({ field, options, joyProps = {}, optionJoyProps = {} }) => {
  const { name, value = [] } = field;
  const { setValue } = useFormContext();

  const optionChange = (event: React.ChangeEvent<HTMLInputElement>, data: string | number) => {
    const realData = value?.includes(data) ? value.filter((item: string | number) => item !== data) : [...value, data];
    setValue(name, realData);
  };

  return (
    <Box {...joyProps} role="group">
      {options?.map((item) => (
        // @ts-ignore
        <Checkbox
          name={`${name}_${item.value}`}
          checked={value?.includes(item?.value)}
          key={item?.value}
          label={item.label}
          onChange={(e) => optionChange(e, item?.value)}
          {...optionJoyProps}
        />
      ))}
    </Box>
  );
};

export default HookCheckboxGroup;
