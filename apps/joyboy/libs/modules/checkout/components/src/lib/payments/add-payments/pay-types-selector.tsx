import React from 'react';
import { Typography, Select, selectClasses, Option, Divider } from '@castlery/fortress';
import { RowWrapper } from './row-wrapper';

export interface PayTypesSelectorProps {
  value: string;
  payTypeChange: (type: string) => void;
  payTypes: string[];
}

export const PayTypesSelector = ({ value, payTypeChange, payTypes }: PayTypesSelectorProps) => {
  const onChange = (event: React.SyntheticEvent | null, newValue: string | null) => {
    if (!newValue) return;
    payTypeChange(newValue);
  };

  if (!payTypes.length) return null;

  return (
    <React.Fragment>
      <RowWrapper>
        <Typography>Type</Typography>
        <Select
          value={value}
          onChange={onChange}
          sx={{
            paddingX: 1,
            paddingY: 0,
            [`&>.${selectClasses.button}`]: {
              fontSize: { xs: 'sm', sm: 'md' },
              lineHeight: 2,
              height: 48,
              color: (theme) => theme.palette.text.primary,
            },
            [`&>.${selectClasses.indicator} >svg`]: {
              color: (theme) => theme.palette.text.primary,
            },
          }}
        >
          {payTypes.map((type) => (
            <Option
              key={type}
              value={type}
              sx={{
                fontSize: { xs: 'sm', sm: 'md' },
                lineHeight: 2,
                height: 48,
              }}
            >
              {type}
            </Option>
          ))}
        </Select>
      </RowWrapper>
      <Divider />
    </React.Fragment>
  );
};

export default PayTypesSelector;
