import React from 'react';
import { Input, Button, FormControl, FormHelperText } from '@mui/joy';
import type { InputProps } from '@mui/joy';

export interface UploadProps extends Omit<InputProps, 'endDecorator' | 'value' | 'onChange'> {
  /** 是否禁用 */
  disabled?: boolean;
  /** 文件名 */
  fileName?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 是否必填 */
  required?: boolean;
  /** 点击上传按钮的回调 */
  onUpload?: () => void;
}

export const Upload = React.forwardRef<HTMLDivElement, UploadProps>((props, ref) => {
  const { disabled = false, fileName, errorMessage, required = false, onUpload, ...other } = props;

  return (
    <FormControl ref={ref} error={!!errorMessage} required={required} disabled={disabled}>
      <Input
        {...other}
        disabled={disabled}
        readOnly
        value={fileName || 'No file chosen'}
        startDecorator={
          <Button disabled={disabled} onClick={onUpload}>
            UPLOAD
          </Button>
        }
      />
      {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
});
