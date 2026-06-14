import React, { memo, useCallback } from 'react';
import { Typography, Divider, Box, NiceModal } from '@castlery/fortress';
import isEqual from 'lodash/isEqual';
import { withUseBreakpoints } from 'utils/page';
import { H1Title } from './Titles';
import { ButtonLink } from './ButtonLink';
import { ButtonGroups } from './ButtonGroups';
import { validators, tipText, form } from './data/profile';
import { HookForm } from 'fortress';
import { useSelector } from 'react-redux';

interface EditProfileProps {
  defaultValue: Record<string, any>;
  cancel: (needTip?: boolean) => void;
  submit: (values: Record<string, any>, subscribe?: any) => void;
  breakpoints: { mobile: boolean; tablet: boolean; md: boolean };
}
const EditProfile: React.FC<EditProfileProps> = memo(({ defaultValue, cancel, submit, breakpoints }) => {
  const { mobile, tablet, md } = breakpoints;
  const user = useSelector((state) => state.auth.user);
  const hasBirthday = user?.profile?.birthday !== '';
  const isMobile = mobile || tablet || md;
  const [methods, setMethods] = React.useState<any>({});
  const [birthdayEnsureModalOpen, setBirthdayEnsureModalOpen] = React.useState<boolean>(false);
  const [profileData, setProfileData] = React.useState<Record<string, any>>({});
  const [btnDisable, setBtnDisable] = React.useState<boolean>(false);

  const sx = React.useMemo(
    () => ({
      form: {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        columnGap: 6,
        rowGap: 4,
        alignItems: 'end',
      },
    }),
    [isMobile]
  );
  const _form = React.useMemo(() => {
    const defaultBirthYear =
      // @ts-ignore
      defaultValue?.birthday && !isNaN(new Date(defaultValue?.birthday)) ? new Date(defaultValue?.birthday) : undefined;
    return form(isMobile, hasBirthday, defaultBirthYear);
  }, [isMobile, defaultValue]);

  const onSubmit = useCallback(
    (values: Record<string, any>) => {
      setBtnDisable(true);
      setProfileData(values);
      if (hasBirthday) {
        let newObj = {};
        if (values?.birthday) {
          newObj = Object.fromEntries(Object.entries(values).filter(([key]) => key !== 'birthday'));
        } else {
          newObj = values;
        }
        submit({
          values: {
            profile_attributes: newObj,
          },
          msg: (isFirst = false) => `Profile updated!${isFirst ? ' 20 credits have been added to your account .' : ''}`,
          refresh: () => setBtnDisable(false),
        });
        return;
      } else {
        setBirthdayEnsureModalOpen(true);
      }
    },
    [setBtnDisable]
  );

  const onModalCancelBtnClick = () => {
    setBirthdayEnsureModalOpen(false);
    setBtnDisable(false);
  };

  const onCancel = () => {
    const values = typeof methods.getValues === 'function' ? methods.getValues() : null;
    if (values && isEqual(values, defaultValue)) {
      // requirement: no changes was made ,then can cancel it directly.
      cancel(false);
      return;
    }
    cancel();
  };
  const methodsGetter = useCallback(({ getValues }) => setMethods({ getValues }), []);

  return (
    <Box
      sx={[
        hasBirthday && {
          '.react-datepicker__input-container': {
            div: {
              background: (theme) => theme.palette.brand.charcoal[200],
              color: '#929292',
              input: {
                cursor: 'default',
              },
            },
          },
        },
      ]}
    >
      <H1Title>Edit Profile Details</H1Title>
      <HookForm
        form={_form}
        validators={validators}
        defaultFetcher={defaultValue}
        formSxProps={sx.form}
        submit={onSubmit}
        methodsGetter={methodsGetter}
      >
        <ButtonGroups mobile={isMobile} cancel={onCancel} submitDisable={btnDisable} />
      </HookForm>
      {!hasBirthday && (
        <NiceModal
          showCloseBtn={false}
          warning
          title="Please note that once you confirm your birth date, it cannot be changed later."
          onConfirm={() => {
            submit({
              values: {
                profile_attributes: profileData,
              },
              msg: (isFirst = false) =>
                `Profile updated!${isFirst ? ' 20 credits have been added to your account .' : ''}`,
              refresh: () => setBtnDisable(false),
            });
          }}
          open={birthdayEnsureModalOpen}
          onCancel={onModalCancelBtnClick}
          onClose={onModalCancelBtnClick}
          confirmText="Confirm"
        />
      )}
      <Divider />
      {/* @ts-ignore */}
      <Typography level="body2" sx={{ paddingY: (theme) => theme.spacing(4) }}>
        {tipText}
        <ButtonLink path="privacy-policy" restProps={{ sx: { paddingX: (theme: any) => theme.spacing(0.5) } }}>
          here
        </ButtonLink>
        .
      </Typography>
    </Box>
  );
});
export default withUseBreakpoints(EditProfile);
