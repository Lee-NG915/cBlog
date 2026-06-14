'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  formHelperTextClasses,
  Input,
  Link,
  Stack,
  useNiceModal,
} from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { form, privacyLink, termsLink, type AddressFormField } from './form.config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { logger } from '@castlery/observability';
import { createCustomerFromPosChannel, type Customer } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';

const formControlSx = {
  gap: 1,
  mb: 6,
  [`& .${formHelperTextClasses.root}`]: {
    mt: 5,
  },
};

const outerBoxSx = { display: 'flex', flexDirection: 'column', gap: 8 };

const ZERO_WIDTH_CHARS_RE = /[\u200B-\u200D\u200E\u200F\uFEFF\u2060\u00AD]/g;

const stripZeroWidthChars = (value: string) => value.replace(ZERO_WIDTH_CHARS_RE, '');

type AddressFormTextKey =
  | `${AddressFormField['translationKey']}.label`
  | `${AddressFormField['translationKey']}.placeholder`;
type AddressFormErrorKey =
  | 'errorMessage.required'
  | 'errorMessage.minLength'
  | 'errorMessage.maxLength'
  | 'errorMessage.validate'
  | 'errorMessage.phoneInvalid';
type AddressFormConsentKey =
  | 'createCustomerConsent.prefix'
  | 'createCustomerConsent.termsOfUse'
  | 'createCustomerConsent.and'
  | 'createCustomerConsent.privacyPolicy'
  | 'createCustomerConsent.suffix';
type AddressFormButtonKey = 'createCustomerButtons.cancel' | 'createCustomerButtons.confirm';

const getFieldTextKey = (
  translationKey: AddressFormField['translationKey'],
  suffix: 'label' | 'placeholder'
): AddressFormTextKey => `${translationKey}.${suffix}`;

export function PosCreateCustomerForm({
  onCancel,
  onCreatedCustomer,
}: {
  onCancel?: () => void;
  onCreatedCustomer: (customer: Customer) => void;
}) {
  const { t } = useTranslation(LocalesNamespace.SHARED, { keyPrefix: 'addressForm' });
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = useNiceModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const getRules = useCallback(
    (field: AddressFormField) => {
      const rules: Record<string, any> = {};

      if (field.required) {
        rules['required'] = t('errorMessage.required' satisfies AddressFormErrorKey);
      }

      // variant A: { minLength?, maxLength? }
      if (field.validation && 'minLength' in field.validation) {
        if (field.validation.minLength) {
          rules['minLength'] = {
            value: field.validation.minLength,
            message: t('errorMessage.minLength' satisfies AddressFormErrorKey, {
              minLength: field.validation.minLength,
            }),
          };
        }
        if (field.validation.maxLength) {
          rules['maxLength'] = {
            value: field.validation.maxLength,
            message: t('errorMessage.maxLength' satisfies AddressFormErrorKey, {
              maxLength: field.validation.maxLength,
            }),
          };
        }
      }

      // variant B: { validate }
      // Capture the narrowed reference before entering the closure to avoid narrowing loss
      if (field.validation && 'validate' in field.validation) {
        const validateFn = field.validation.validate;
        rules['validate'] = (value: string) => {
          const isNotEmpty = value !== undefined && value !== null && value !== '';
          const isValid = isNotEmpty ? validateFn(value) : true;
          if (isValid) return isValid;
          if (field.key === 'phone') return t('errorMessage.phoneInvalid' satisfies AddressFormErrorKey);
          return t('errorMessage.validate' satisfies AddressFormErrorKey);
        };
      }

      return rules;
    },
    [t]
  );

  const fieldRules = useMemo(() => Object.fromEntries(form.map((field) => [field.key, getRules(field)])), [getRules]);

  const onSubmit = useCallback(
    async (data: FieldValues) => {
      try {
        setIsLoading(true);
        const { user } = await dispatch(createCustomerFromPosChannel.initiate(data)).unwrap();
        onCreatedCustomer(user);
      } catch (err: any) {
        const message =
          err?.data?.errors?.[0]?.detail || err?.data?.message || 'Failed to create customer. Please try again.';
        modal.warning({
          title: 'Error',
          content: message,
          showCancelBtn: false,
          confirmText: 'OK',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, modal, onCreatedCustomer]
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return (
    <Box sx={outerBoxSx}>
      {contextHolder}
      <form onSubmit={handleSubmit(onSubmit)}>
        {form.map((field) => (
          <Controller
            key={field.key}
            name={field.key}
            control={control}
            rules={fieldRules[field.key]}
            render={({ field: rhfField }) => (
              <FormControl required={field.required} disabled={field.disabled} sx={formControlSx}>
                <FormLabel>
                  <Typography level="body2">{t(getFieldTextKey(field.translationKey, 'label'))}</Typography>
                </FormLabel>
                <Input
                  variant="borderplain"
                  {...rhfField}
                  placeholder={t(getFieldTextKey(field.translationKey, 'placeholder'))}
                  disabled={field.disabled}
                  error={!!errors[field.key]}
                  value={rhfField.value}
                  onChange={(e) => {
                    const cleanedValue = stripZeroWidthChars(e.target.value).trim();
                    rhfField.onChange(field.formatter ? field.formatter(cleanedValue) : cleanedValue);
                  }}
                />
                {errors[field.key] && (
                  <FormHelperText sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Error width={20} height={20} />
                    {String(errors[field.key]?.message ?? '')}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        ))}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 8 }}>
          <Button variant="tertiary" onClick={handleCancel}>
            {t('createCustomerButtons.cancel' satisfies AddressFormButtonKey)}
          </Button>
          <Button type="submit" loading={isLoading}>
            {t('createCustomerButtons.confirm' satisfies AddressFormButtonKey)}
          </Button>
        </Stack>
      </form>
      <Typography level="caption1">
        {t('createCustomerConsent.prefix' satisfies AddressFormConsentKey)}{' '}
        <Link underline="always" rel="noreferrer" target="_blank" href={termsLink}>
          {t('createCustomerConsent.termsOfUse' satisfies AddressFormConsentKey)}
        </Link>{' '}
        {t('createCustomerConsent.and' satisfies AddressFormConsentKey)}{' '}
        <Link underline="always" rel="noreferrer" target="_blank" href={privacyLink}>
          {t('createCustomerConsent.privacyPolicy' satisfies AddressFormConsentKey)}
        </Link>
        {t('createCustomerConsent.suffix' satisfies AddressFormConsentKey)}
      </Typography>
    </Box>
  );
}
