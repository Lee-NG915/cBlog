import React, { useMemo, memo, useState } from 'react';
import { Box, HookForm } from '@castlery/fortress';
import isEqual from 'lodash/isEqual';
import { withUseBreakpoints } from 'utils/page';
import { H1Title } from './Titles';
import { ButtonGroups } from './ButtonGroups';
import { form, validators } from './data/account';

interface EditAccountDetailProps {
  subscription: Record<string, boolean>;
  defaultValue: Record<string, any>;
  cancel: (needTip?: boolean) => void;
  submit: (values: Record<string, any>, subscribe?: { email: boolean; sms: boolean }) => void;
  breakpoints: { mobile: boolean; tablet: boolean; md: boolean };
}
const EditAccountDetail: React.FC<EditAccountDetailProps> = memo(
  ({ defaultValue, subscription, cancel, submit, breakpoints }) => {
    const { mobile, tablet, md } = breakpoints;
    const isMobile = mobile || tablet || md;
    const [methods, setMethods] = useState<any>({});
    const [btnDisable, setBtnDisable] = useState<boolean>(false);

    const defaultData = useMemo(
      () => ({
        ...defaultValue,
        subscriptionEmail: subscription.email,
        subscriptionSms: subscription.sms,
      }),
      [defaultValue, subscription]
    );
    const onCancel = () => {
      const values = typeof methods?.getValues === 'function' ? methods.getValues() : null;
      if (values && isEqual(values, defaultData)) {
        cancel(false);
        return;
      }
      cancel();
    };

    const onSubmit = React.useCallback((values) => {
      const { subscriptionSms, subscriptionEmail, ...rest } = values;
      setBtnDisable(true);
      submit({
        values: rest,
        subscribe: { email: !!subscriptionEmail, sms: !rest?.phone ? false : !!subscriptionSms },
        msg: 'Account details updated!',
        refresh: () => setBtnDisable(false),
      });
    }, []);

    const _form = useMemo(() => form(isMobile), [isMobile]);

    const formSx = useMemo(
      () => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        columnGap: 6,
        rowGap: 4,
      }),
      [isMobile]
    );

    const methodsGetter = React.useCallback(({ getValues }) => setMethods({ getValues }), []);
    return (
      <Box>
        <H1Title>Edit Account Details</H1Title>
        <HookForm
          form={_form}
          validators={validators}
          formSxProps={formSx}
          defaultFetcher={defaultData}
          submit={onSubmit}
          methodsGetter={methodsGetter}
        >
          <ButtonGroups mobile={isMobile} submitDisable={btnDisable} cancel={onCancel} />
        </HookForm>
      </Box>
    );
  }
);

export default withUseBreakpoints(EditAccountDetail);
