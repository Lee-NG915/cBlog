'use client';
import {
  Box,
  Button,
  Checkbox,
  Dropdown,
  FormControl,
  FormHelperText,
  formHelperTextClasses,
  FormLabel,
  Input,
  Option,
  Typography,
  useNiceModal,
} from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import {
  useCreateCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  useUpdateCustomerAddressV2Mutation,
  useCreateCustomerAddressV2Mutation,
} from '@castlery/modules-user-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { CustomerAddressEntity, CustomerAddressEntity_V2 } from '@castlery/types';
import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { Controller, FieldValues, useForm, FieldError } from 'react-hook-form';
import { getVersionFormData } from './get-version-form-data';
import { CUSTOMER_DEFAULT_FIRSTNAME, CUSTOMER_DEFAULT_LASTNAME, accessInWeb } from '@castlery/config';
import { type AddressFormField, getNewVersionAddressFormValues } from './config/base';

export const addressFormClasses = {
  footer: 'address-form-footer',
};

const ZERO_WIDTH_CHARS_RE = /[\u200B-\u200D\u200E\u200F\uFEFF\u2060\u00AD]/g;

const stripZeroWidthChars = (value: string) => value.replace(ZERO_WIDTH_CHARS_RE, '');

type AddressFormTextKey =
  | `${AddressFormField['translationKey']}.label`
  | `${AddressFormField['translationKey']}.placeholder`;
type AddressFormErrorKey =
  | 'errorMessage.required'
  | 'errorMessage.minLength'
  | 'errorMessage.maxLength'
  | 'errorMessage.pattern'
  | 'errorMessage.validate'
  | 'errorMessage.zipcodeInvalid'
  | 'errorMessage.phoneInvalid';
type AddressFormModalKey =
  | 'errorPrompt.title'
  | 'errorPrompt.content'
  | 'errorPrompt.confirmText'
  | 'unsavedChanges.title'
  | 'unsavedChanges.content'
  | 'unsavedChanges.cancelText'
  | 'unsavedChanges.confirmText'
  | 'cancel'
  | 'save';

const getFieldTextKey = (
  translationKey: AddressFormField['translationKey'],
  suffix: 'label' | 'placeholder'
): AddressFormTextKey => `${translationKey}.${suffix}`;

const formGridSx = {
  py: 4,
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  alignItems: 'flex-end',
  rowGap: { xs: 4, sm: 5 },
  columnGap: { sm: 4 },
} as const;

const formControlSx = {
  gap: 1,
  [`& .${formHelperTextClasses.root}`]: {
    mt: 5,
  },
} as const;

const formHelperTextSx = { display: 'flex', alignItems: 'center', gap: 1 } as const;

const DEFAULT_PLACEHOLDER_NAME = `${CUSTOMER_DEFAULT_FIRSTNAME}${CUSTOMER_DEFAULT_LASTNAME}`.trim().toUpperCase();

export enum AddressFormActionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
}

export interface AddressFormProps {
  /**
   * The callback function when the user clicks the cancel button
   */
  onCancel: () => void;
  /**
   * The callback function when the user saves the address
   * @param addressId Optional, if the action type is `ADD`, the addressId is undefined
   * @returns
   */
  onSaved?: (addressId: number) => Promise<void>;
  /**
   * The fields of new version form use camelCase format, old version form uses snake case format
   * @default false
   */
  useNewVersion?: boolean;
  /**
   * The action type of the form, `ADD` or `UPDATE`.
   * @param ADD If actionType is `ADD`, the form is submitted through the create address API.
   * @param UPDATE If actionType is `UPDATE`, the form is submitted through the update address API.
   * @default `ADD`
   */
  actionType?: AddressFormActionType;
  /**
   * The ref of the form
   * @default null
   */
  formRef?: React.RefObject<HTMLFormElement>;
  /**
   * The default address of the form
   * @default null
   */
  defaultAddress?: CustomerAddressEntity | CustomerAddressEntity_V2 | null;
  updatedAddress?: CustomerAddressEntity | CustomerAddressEntity_V2 | null;
  /**
   * The text of the save button
   * @default 'SAVE'
   */
  saveButtonText?: string;
}

/**
 * prd : https://castlery.atlassian.net/wiki/x/lwEds
 * @param param0
 * @returns
 */
export const AddressForm = memo(function AddressForm({
  useNewVersion = false,
  actionType = AddressFormActionType.ADD,
  formRef,
  defaultAddress,
  onCancel,
  onSaved,
  saveButtonText,
  updatedAddress,
}: AddressFormProps) {
  const formList = getVersionFormData(useNewVersion);
  const addressFromRef = formRef || null;
  const { t } = useTranslation(LocalesNamespace.SHARED, { keyPrefix: 'addressForm' });

  const [floorUnitCheckboxChecked, setFloorUnitCheckboxChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateCustomerAddress] = useUpdateCustomerAddressMutation();
  const [updateCustomerAddressV2] = useUpdateCustomerAddressV2Mutation();
  const [createCustomerAddress] = useCreateCustomerAddressMutation();
  const [createCustomerAddressV2] = useCreateCustomerAddressV2Mutation();
  const [modal, modalContextHolder] = useNiceModal();

  const saveTrigger = useMemo(() => {
    if (actionType === AddressFormActionType.ADD) {
      return useNewVersion ? createCustomerAddressV2 : createCustomerAddress;
    }
    return useNewVersion ? updateCustomerAddressV2 : updateCustomerAddress;
  }, [
    actionType,
    createCustomerAddress,
    updateCustomerAddress,
    useNewVersion,
    createCustomerAddressV2,
    updateCustomerAddressV2,
  ]);

  // Generate defaultValues, prefer existing address data, then field default value
  const defaultValues = useMemo(() => {
    // Always create a new object to avoid mutating the prop
    const baseData: any = defaultAddress
      ? useNewVersion
        ? getNewVersionAddressFormValues(defaultAddress)
        : { ...defaultAddress }
      : {};

    // Clear placeholder names when address exists
    if (defaultAddress) {
      const fullName = `${baseData.firstname ?? ''}${baseData.lastname ?? ''}`.trim().toUpperCase();
      if (fullName === DEFAULT_PLACEHOLDER_NAME) {
        baseData.firstname = '';
        baseData.lastname = '';
      }
    }

    const formValues = Object.fromEntries(
      formList.map((field) => {
        // Use custom rewrite function if provided
        if ('defaultValueReWrite' in field && field.defaultValueReWrite) {
          return [field.key, field.defaultValueReWrite(baseData as CustomerAddressEntity | CustomerAddressEntity_V2)];
        }

        // Use address value or field default value
        const addressValue = baseData[field.key];
        const fieldDefaultValue = 'value' in field ? field.value?.trim() ?? undefined : undefined;

        return [field.key, addressValue ?? fieldDefaultValue];
      })
    );

    // When !defaultAddress, baseData is {} so spread is equivalent to formValues only
    return { ...baseData, ...formValues };
  }, [defaultAddress, formList, useNewVersion]);

  const {
    handleSubmit,
    control,
    unregister,
    register,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: 'all',
    defaultValues,
  });

  useEffect(() => {
    if (updatedAddress) {
      const updatedAddressData = useNewVersion ? getNewVersionAddressFormValues(updatedAddress) : updatedAddress;
      reset(updatedAddressData);
    }
  }, [updatedAddress, reset, useNewVersion]);

  // Filter out level and flat fields when checkbox is checked (user doesn't have floor/unit number)
  const filteredAddressFormData = useMemo(() => {
    return floorUnitCheckboxChecked
      ? formList.filter((field) => field.key !== 'level' && field.key !== 'flat')
      : formList;
  }, [floorUnitCheckboxChecked, formList]);

  // Validation rules generator
  const getRules = useCallback(
    (field: AddressFormField) => {
      const rules: any = {};

      if (field.required) {
        rules.required = t('errorMessage.required' satisfies AddressFormErrorKey);
      }

      if (field.validation && 'minLength' in field.validation) {
        if (field.validation.minLength) {
          rules.minLength = {
            value: field.validation.minLength,
            message: t('errorMessage.minLength' satisfies AddressFormErrorKey, {
              minLength: field.validation.minLength,
            }),
          };
        }

        if (field.validation.maxLength) {
          rules.maxLength = {
            value: field.validation.maxLength,
            message: t('errorMessage.maxLength' satisfies AddressFormErrorKey, {
              maxLength: field.validation.maxLength,
            }),
          };
        }
      }

      if (field.validation && 'pattern' in field.validation) {
        rules.pattern = {
          value: field.validation.pattern,
          message: t('errorMessage.pattern' satisfies AddressFormErrorKey),
        };
      }

      if (field.validation && 'validate' in field.validation) {
        const validateFn = field.validation.validate;
        rules.validate = (value: string) => {
          const isNotEmpty = value !== undefined && value !== null && value !== '';
          const isValid = isNotEmpty ? validateFn(value) : true;

          if (isValid) return isValid;

          // Return specific error message based on field type
          if (field.key === 'zipcode') return t('errorMessage.zipcodeInvalid' satisfies AddressFormErrorKey);
          if (field.key === 'phone' || field.key === 'alternativePhone') {
            return t('errorMessage.phoneInvalid' satisfies AddressFormErrorKey);
          }
          return t('errorMessage.validate' satisfies AddressFormErrorKey);
        };
      }

      return rules;
    },
    [t]
  );
  const onCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      setFloorUnitCheckboxChecked(isChecked);

      if (isChecked) {
        // User doesn't have floor/unit, unregister these fields
        unregister('level');
        unregister('flat');
      } else {
        // User has floor/unit, register these fields as required
        register('level', { required: true });
        register('flat', { required: true });
      }
    },
    [register, unregister]
  );

  // Helper function to build address1 from components
  const buildAddress1 = useCallback(
    (data: FieldValues) => {
      const formKeys = new Set(formList.map((f) => f.key));
      const hasStreetNumber = formKeys.has('streetNumber') || formKeys.has('street_number');

      const streetNumber = hasStreetNumber ? data.streetNumber ?? data.street_number ?? '' : '';
      const street = data.street ?? '';
      const level = data.level ?? '';
      const flat = data.flat ?? '';
      const unit = data.unit ?? '';

      return `${streetNumber} ${street} ${level} ${flat} ${unit}`.trim();
    },
    [formList]
  );

  // Helper function to prepare form data for submission
  const prepareFormData = useCallback(
    (data: FieldValues) => {
      let preparedData = { ...data };

      if (defaultValues) {
        preparedData = {
          ...defaultValues,
          ...data,
          id: defaultAddress?.id,
        };
      }
      // Normalize state field
      // 冗余字段，前端未使用，后端接口需要这些字段，所以需要转换
      if (useNewVersion) {
        preparedData.state = data.stateName || data.state || data.state_name || '';
        preparedData.streetNumber = data.streetNumber || data.street_number || '';
      } else {
        preparedData.street_number = data.street_number || '';
        preparedData.state = data.state || data.state_name || '';
      }

      // Build address1 from components
      preparedData.address1 = buildAddress1(data);

      // Strip zero-width characters and trim leading/trailing spaces from all string fields
      for (const key of Object.keys(preparedData)) {
        if (typeof preparedData[key] === 'string') {
          preparedData[key] = stripZeroWidthChars(preparedData[key]).trim();
        }
      }

      return preparedData;
    },
    [defaultValues, buildAddress1, useNewVersion, defaultAddress]
  );

  // Helper function to extract error message from API response
  const getErrorMessage = useCallback(
    (error: any): string => {
      if ('data' in error && error.data?.errors?.[0]?.detail) {
        return error.data.errors[0].detail;
      }
      return t('errorPrompt.content' satisfies AddressFormModalKey);
    },
    [t]
  );

  const onSubmit = useCallback(
    async (data: FieldValues) => {
      try {
        setLoading(true);

        const preparedData = prepareFormData(data);
        const addressId = preparedData?.id;

        const res = await saveTrigger({ address: preparedData });

        if (res.error) {
          const errorDetail = getErrorMessage(res.error);
          throw Error(errorDetail);
        }

        if (useNewVersion) {
          await onSaved?.(res.data?.id);
        } else {
          // Handle success callback
          if (actionType === AddressFormActionType.ADD) {
            const list = res.data?.addresses;
            const lastInsertedId = Array.isArray(list) && list.length > 0 ? list[list.length - 1]?.id : 0;
            if (lastInsertedId) {
              await onSaved?.(lastInsertedId);
            }
          } else if (addressId) {
            await onSaved?.(addressId);
          }
        }

        onCancel?.();
      } catch (error) {
        // Show error modal
        modal.warning({
          title: t('errorPrompt.title' satisfies AddressFormModalKey),
          content: error instanceof Error ? error.message : t('errorPrompt.content' satisfies AddressFormModalKey),
          showCancelBtn: false,
          confirmText: t('errorPrompt.confirmText' satisfies AddressFormModalKey),
        });
      } finally {
        setLoading(false);
      }
    },
    [actionType, prepareFormData, saveTrigger, getErrorMessage, onSaved, onCancel, modal, t, useNewVersion]
  );
  const handleCancel = useCallback(() => {
    if (!isDirty) {
      onCancel?.();
      return;
    }

    modal.confirmation({
      title: t('unsavedChanges.title' satisfies AddressFormModalKey),
      desc: t('unsavedChanges.content' satisfies AddressFormModalKey),
      cancelText: t('unsavedChanges.cancelText' satisfies AddressFormModalKey),
      confirmText: t('unsavedChanges.confirmText' satisfies AddressFormModalKey),
      onCancel: () => {
        onCancel?.();
      },
    });
  }, [isDirty, onCancel, modal, t]);

  return (
    <>
      <form
        ref={addressFromRef}
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: accessInWeb ? 'inherit' : 'auto' }}
        noValidate
      >
        <Box sx={formGridSx}>
          {filteredAddressFormData.map((field) => (
            <Box key={field.key} mb={2} sx={{ ...field.layoutStyle }}>
              {field.type !== 'checkbox' ? (
                <Controller
                  name={field.key}
                  control={control}
                  rules={getRules(field)}
                  render={({ field: rhfField }) => (
                    <FormControl required={field.required} disabled={field.disabled} sx={formControlSx}>
                      <FormLabel>
                        <Typography level="body2">{t(getFieldTextKey(field.translationKey, 'label'))}</Typography>
                      </FormLabel>
                      {field.type === 'input' && (
                        <Input
                          variant="borderplain"
                          {...rhfField}
                          placeholder={t(getFieldTextKey(field.translationKey, 'placeholder'))}
                          disabled={field.disabled}
                          error={!!errors[field.key]}
                          value={rhfField.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only strip zero-width chars during input; trim leading/trailing spaces at submit time
                            const cleanedValue = stripZeroWidthChars(value);
                            if (field.formatter) {
                              rhfField.onChange(field.formatter(cleanedValue));
                            } else {
                              rhfField.onChange(cleanedValue);
                            }
                          }}
                        />
                      )}
                      {field.type === 'select' && (
                        <Dropdown
                          variant="form"
                          {...rhfField}
                          placeholder={t(getFieldTextKey(field.translationKey, 'placeholder'))}
                          value={rhfField.value}
                          renderValue={() => rhfField.value}
                          onChange={(_, value) => rhfField.onChange(value)}
                          disabled={field.disabled}
                        >
                          {field.options?.map((opt) => (
                            <Option key={opt.value} value={opt.value}>
                              {opt.label}
                            </Option>
                          ))}
                        </Dropdown>
                      )}
                      {errors[field.key] && (
                        <FormHelperText sx={formHelperTextSx}>
                          <Error width={20} height={20} />
                          {(errors[field.key] as FieldError)?.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              ) : (
                <Checkbox
                  {...field}
                  label={t(getFieldTextKey(field.translationKey, 'label'))}
                  variant="outlined"
                  checked={floorUnitCheckboxChecked}
                  onChange={onCheckboxChange}
                />
              )}
            </Box>
          ))}
        </Box>
        <Box
          className={addressFormClasses.footer}
          sx={{
            py: 6,
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            justifyContent: { md: 'space-between' },
            alignItems: { md: 'center' },
            flexGrow: { xs: 1, md: 0 },
            gap: { xs: 4, md: 0 },
          }}
        >
          <Button variant="outlined" type="button" onClick={handleCancel} sx={{ minWidth: 154 }}>
            {t('cancel' satisfies AddressFormModalKey)}
          </Button>
          <Button type="submit" disabled={!isValid || loading} loading={loading} sx={{ minWidth: 154 }}>
            {saveButtonText || t('save' satisfies AddressFormModalKey)}
          </Button>
        </Box>
      </form>
      {modalContextHolder}
    </>
  );
});

export default AddressForm;
