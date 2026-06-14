import React from 'react';
import Box from '@mui/joy/Box';
import { FormData, ValidatorsData } from '@castlery/fortress/HookForm/types';
import { Button, HookForm } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { useDevice } from 'utils/hooks';

const form: FormData = [
  {
    key: 'password',
    label: 'New Password',
    type: 'input',
    subType: 'password',
    placeholder: '-',
    joyProps: {
      variant: 'outlined',
    },
  },
  {
    key: 'repeat_password',
    label: 'Repeat Password',
    type: 'input',
    subType: 'password',
    placeholder: '-',
    joyProps: {
      variant: 'outlined',
    },
  },
];
const validators: ValidatorsData = {
  password: {
    required: true,
    validator: 'password',
  },
  repeat_password: {
    required: true,
    validator: (values: Record<string, any>) => {
      const value = values.repeat_password;
      const tar = values.password;
      const isError = tar !== value;
      return isError ? { type: 'custom', message: 'Passwords do not match' } : null;
    },
  },
};
interface ResetPasswordPageProps {
  OnSubmit: (data: Record<string, any>, refresh?: () => void) => void;
}
const ResetPasswordForm: React.FC<ResetPasswordPageProps> = ({ OnSubmit }) => {
  const [processing, setProcessing] = React.useState(false);

  const device = useDevice();
  const sx = React.useMemo(
    () => ({
      form: { display: 'grid', rowGap: 4.5, width: device === 'mobile' ? '100%' : 454 },
      button: {
        width: device === 'mobile' ? '100%' : 454,
        marginTop: (theme: any) => theme.spacing(4),
        display: 'flex',
        justifyContent: 'space-between',
      },
    }),
    [device]
  );
  const submit = React.useCallback((values) => {
    setProcessing(true);
    OnSubmit(values, () => setProcessing(false));
  }, []);
  return (
    <Box>
      <HookForm form={form} validators={validators} submit={submit} formSxProps={sx.form}>
        <Button type="submit" endDecorator={<ArrowRight />} sx={sx.button} loading={processing}>
          Save & Sign In
        </Button>
      </HookForm>
    </Box>
  );
};

export default ResetPasswordForm;
