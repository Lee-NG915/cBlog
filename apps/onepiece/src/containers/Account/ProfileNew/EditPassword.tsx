import React from 'react';
import { Box, HookForm } from '@castlery/fortress';
import { withUseBreakpoints } from 'utils/page';
import { encryptPassword } from 'utils/passwordEncryption';
import { H1Title } from './Titles';
import { ButtonGroups } from './ButtonGroups';
import { form, validators } from './data/password';

interface EditPasswordProps {
  email: string;
  cancel(needTip?: boolean): void;
  submit: (values: Record<string, any>, subscribe?: any) => void;
  breakpoints: { mobile: boolean; tablet: boolean };
}
const EditPassword: React.FC<EditPasswordProps> = ({ email, cancel, submit, breakpoints }) => {
  const { mobile, tablet } = breakpoints;
  const isMobile = mobile || tablet;
  const [methods, setMethods] = React.useState<any>({});
  const [btnDisable, setBtnDisable] = React.useState<boolean>(false);

  const _form = React.useMemo(() => form(email), [email]);
  const formSx = React.useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(auto,500px)',
      rowGap: 4,
    }),
    [isMobile]
  );
  const onCancel = () => {
    const values = typeof methods.getValues === 'function' ? methods.getValues() : {};
    if (!values.password && !values.password && !values.password) {
      // requirement: no changes was made ,then can cancel it directly.
      cancel(false);
      return;
    }
    cancel();
  };
  const onSubmit = React.useCallback((values: Record<string, any>) => {
    const { new_password, password } = values;
    setBtnDisable(true);
    submit({
      values: {
        new_password: encryptPassword(new_password),
        password: encryptPassword(password),
        version: 1,
      },
      msg: 'Password updated!',
      refresh: () => setBtnDisable(false),
    });
  }, []);
  const methodsGetter = React.useCallback(({ getValues }) => setMethods({ getValues }), []);

  return (
    <Box>
      <H1Title>Update Password</H1Title>
      <HookForm
        form={_form}
        validators={validators}
        defaultFetcher={{}}
        submit={onSubmit}
        formSxProps={formSx}
        methodsGetter={methodsGetter}
      >
        <ButtonGroups mobile={isMobile} cancel={onCancel} submitDisable={btnDisable} />
      </HookForm>
    </Box>
  );
};

export default withUseBreakpoints(EditPassword);
