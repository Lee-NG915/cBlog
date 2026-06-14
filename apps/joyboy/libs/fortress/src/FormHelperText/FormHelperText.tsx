import { FormHelperText as JoyFormHelperText } from '@mui/joy';
import { FormHelperTextProps as JoyFormHelperTextProps } from '@mui/joy';
import { Error } from '../Icons';
import FormControlContext from '@mui/joy/FormControl/FormControlContext';
import { Box } from '@mui/joy';
import React from 'react';

const containerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  position: 'absolute',
  bottom: '-20px',
  left: 0,
} as const;

const errorIconStyles = {
  '--fortress-icon-width': '15px',
  '--fortress-icon-height': '15px',
  color: 'var(--fortress-palette-danger-500)',
  fill: 'var(--fortress-palette-danger-500)',
} as const;

const FormHelperText = React.memo((props: JoyFormHelperTextProps) => {
  const formControl = React.useContext(FormControlContext);
  const isError = formControl?.error || false;

  return (
    <Box sx={containerStyles} className="form-helper-text-container">
      {isError && <Error sx={errorIconStyles} />}
      <JoyFormHelperText
        {...props}
        sx={{
          mt: 0,
          ...props.sx,
        }}
      />
    </Box>
  );
});

FormHelperText.displayName = 'FormHelperText';

export default FormHelperText;
export { FormHelperText };
export type FormHelperTextProps = JoyFormHelperTextProps;
