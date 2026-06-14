'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Input,
  Checkbox,
  Stack,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  useBreakpoints,
  Link,
} from '@castlery/fortress';
import { User } from '@castlery/types';
import { useForm, Controller } from 'react-hook-form';
import { phoneNumberFormattingUtils, validatePhoneNumber } from '@castlery/shared-components';
import { EcEnv, accessInAuAndUS } from '@castlery/config';
import { logger } from '@castlery/observability/client';

interface EditAccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emailSubscription?: boolean;
  mobileSubscription?: boolean;
}

interface EditDetailProps {
  customerInfo?: User | null;
  msgSubscription?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  modal: any;
}

export function EditDetail({ customerInfo = null, msgSubscription = null, onCancel, onSave, modal }: EditDetailProps) {
  const [loading, setLoading] = useState(false);
  const { mobile } = useBreakpoints();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<EditAccountFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: customerInfo?.firstname || '',
      lastName: customerInfo?.lastname || '',
      email: customerInfo?.email || '',
      phoneNumber: customerInfo?.phone || '',
      emailSubscription: msgSubscription.email || false,
      mobileSubscription: msgSubscription.sms || false,
    },
  });

  // useEffect(() => {
  //   if (customerInfo) {
  //     console.log('customerInfo--------------------- effect', customerInfo);
  //     reset({
  //       firstName: customerInfo.firstname || '',
  //       lastName: customerInfo.lastname || '',
  //       email: customerInfo.email || '',
  //       phoneNumber: customerInfo.phone || '',
  //       emailSubscription: msgSubscription.email || false,
  //       mobileSubscription: msgSubscription.sms || false,
  //     });
  //   }
  // }, [customerInfo, msgSubscription, reset]);

  // 监听 phoneNumber 字段
  const phoneNumber = watch('phoneNumber');
  const hasPhoneNumber = phoneNumber && phoneNumber.trim().length > 0;

  // 验证规则定义 - 类似reviews-form中注释掉的validationRules
  const validationRules = {
    firstName: {
      required: 'There is a mandatory field',
      minLength: { value: 2, message: 'This field must contain 2 to 20 characters' },
      maxLength: { value: 20, message: 'This field must contain 2 to 20 characters' },
      pattern: {
        value: /^[\w\s]{2,20}$/, //[A-Za-z0-9_ ]
        message: 'This field contains 2 to 20 alphabet letters',
      },
    },
    lastName: {
      required: 'There is a mandatory field',
      minLength: { value: 2, message: 'This field must contain 2 to 20 characters' },
      maxLength: { value: 20, message: 'This field must contain 2 to 20 characters' },
      pattern: {
        value: /^[\w\s]{2,20}$/, //[A-Za-z0-9_ ]
        message: 'This field contains 2 to 20 alphabet letters',
      },
    },
    email: {
      required: 'There is a mandatory field',
      pattern: {
        value:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        message: 'Please enter a valid email address',
      },
    },
    phoneNumber: {
      validate: (value: string) => {
        if (!value || value.trim() === '') return true; // 允许空值
        return validatePhoneNumber(value) || 'Please enter a valid phone number';
      },
    },
  };

  const onSubmit = async (formData: EditAccountFormData) => {
    const userData: any = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      phone: formData.phoneNumber || '',
    };
    const subscriptionData: any = {
      email: !!formData.emailSubscription,
      sms: !formData.phoneNumber ? false : !!formData.mobileSubscription,
    };
    try {
      setLoading(true);
      await onSave({ userData, subscriptionData, msg: 'Account details has been updated!' });
      onCancel();
    } catch (error) {
      logger.error('Failed to save account details', {
        error,
        userId: userData.id,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      modal.danger({
        title: 'There are unsaved changes',
        desc: 'Any unsaved changes to your account details will be lost.',
        cancelText: 'Discard changes',
        confirmText: 'Continue editing',
        onCancel: () => {
          onCancel();
        },
      });
    } else {
      reset();
      onCancel();
    }
  };

  return (
    <Box>
      <Typography level="h1" sx={{ mb: 6 }}>
        Edit Account Details
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: {
              xs: 3,
              sm: 4,
              md: 2,
            },
            rowGap: {
              xs: 1,
              sm: 2,
              md: 2,
            },
            '& .Mui-error': {
              color: 'var(--fortress-palette-danger-500)',
            },
            '& .MuiFormControl-root': {
              marginTop: 'auto',
              overflow: 'hidden',
              paddingBottom: 5,
              '.form-helper-text-container': { bottom: 0 },
            },
          }}
        >
          <Controller
            name="firstName"
            control={control}
            rules={validationRules.firstName}
            render={({ field }) => (
              <FormControl required error={!!errors.firstName}>
                <FormLabel>First Name</FormLabel>
                <Input {...field} variant="borderplain" placeholder="Enter First Name" error={!!errors.firstName} />
                {errors.firstName && <FormHelperText>{errors.firstName.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="lastName"
            control={control}
            rules={validationRules.lastName}
            render={({ field }) => (
              <FormControl required error={!!errors.lastName}>
                <FormLabel>Last Name</FormLabel>
                <Input {...field} variant="borderplain" placeholder="Enter Last Name" error={!!errors.lastName} />
                {errors.lastName && <FormHelperText>{errors.lastName.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={validationRules.email}
            render={({ field }) => (
              <FormControl required error={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  id="account-edit-email"
                  {...field}
                  variant="borderplain"
                  type="email"
                  placeholder="Enter Email"
                  error={!!errors.email}
                />
                {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            rules={validationRules.phoneNumber}
            render={({ field }) => (
              <FormControl error={!!errors.phoneNumber}>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  {...field}
                  variant="borderplain"
                  type="tel"
                  placeholder="Enter Phone Number"
                  error={!!errors.phoneNumber}
                  onChange={(e) => {
                    const formattedValue = phoneNumberFormattingUtils[EcEnv.NEXT_PUBLIC_COUNTRY](e.target.value);
                    field.onChange(formattedValue);
                  }}
                />
                {errors.phoneNumber && <FormHelperText>{errors.phoneNumber.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Box>

        <Stack spacing={2} sx={{ my: mobile ? 6 : 8 }}>
          <Controller
            name="emailSubscription"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                label="I’d like to receive promotional emails from Castlery."
              />
            )}
          />

          {hasPhoneNumber && (
            <Controller
              name="mobileSubscription"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  label={
                    accessInAuAndUS ? (
                      <>
                        I'd like to receive promotional messages from Castlery on text message/instant messaging apps
                        (e.g. Whatsapp) By continuing you agree with our Privacy Policy and{' '}
                        <Link
                          variant="primary"
                          level="body2"
                          href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/terms-of-use`}
                          sx={{ zIndex: 9 }}
                        >
                          Terms
                        </Link>{' '}
                        of{' '}
                        <Link
                          variant="primary"
                          level="body2"
                          href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/privacy-policy`}
                          sx={{ zIndex: 9 }}
                        >
                          Use
                        </Link>
                        . You're free to unsubscribe any time.
                      </>
                    ) : (
                      <>
                        I'd like to receive promotional messages from Castlery on SMS/instant messaging apps (e.g.
                        WhatsApp).
                      </>
                    )
                  }
                />
              )}
            />
          )}
        </Stack>

        <Stack direction={mobile ? 'column-reverse' : 'row'} spacing={mobile ? 4 : 6}>
          <Button variant="outlined" color="neutral" onClick={handleCancel} disabled={loading}>
            BACK
          </Button>
          <Button type="submit" color="primary" loading={loading}>
            SAVE DETAILS
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
