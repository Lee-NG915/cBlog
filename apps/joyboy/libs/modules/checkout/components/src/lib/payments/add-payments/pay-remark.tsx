import React, { useCallback, useMemo } from 'react';
import { Typography, Textarea, textareaClasses } from '@castlery/fortress';
import { RowWrapper } from './row-wrapper';
import { PayMethod } from '@castlery/modules-checkout-domain';

export interface PayRemarkProps {
  value: string;
  payMethod: PayMethod | undefined;
  commentChange: (value: string) => void;
}

export const PayRemark = ({ value, payMethod, commentChange }: PayRemarkProps) => {
  const label = useMemo(
    () =>
      payMethod?.response_code_required
        ? payMethod?.response_code_hint || 'Code'
        : payMethod?.auto_response_code
        ? 'Code'
        : 'Comments',
    [payMethod]
  );
  const placeholder = useMemo(
    () => (payMethod?.response_code_required && payMethod?.response_code_hint ? `Add Code` : 'Add comments'),
    [payMethod]
  );
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value?.trim();
      commentChange(value);
    },
    [commentChange]
  );

  return (
    <React.Fragment>
      <RowWrapper>
        <Typography>{label}</Typography>
        <Textarea
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          sx={{
            paddingX: 2,
            paddingY: 1.5,
            fontSize: { xs: 'sm', sm: 'md' },
            color: (theme) => theme.palette.text.primary,
            [`&>.${textareaClasses.textarea}`]: {
              color: (theme) => theme.palette.text.primary,
            },
          }}
        />
      </RowWrapper>
    </React.Fragment>
  );
};

export default PayRemark;
