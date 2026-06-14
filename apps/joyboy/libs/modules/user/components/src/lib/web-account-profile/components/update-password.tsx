'use client';

import { useState } from 'react';
import {
  Typography,
  Button,
  Input,
  Stack,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Link,
  useBreakpoints,
} from '@castlery/fortress';
import { useForm, Controller } from 'react-hook-form';
import { encryptPassword } from '@castlery/utils';
import { useRecoverPasswordMutation } from '@castlery/modules-user-domain';
import { User } from '@castlery/types';
import { logger } from '@castlery/observability/client';

interface UpdatePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface UpdatePasswordFormProps {
  onCancel: () => void;
  onSave: ({ userData, subscriptionData, msg }: { userData: any; subscriptionData?: any; msg: string }) => void;
  customerInfo: User | null;
  modal: any;
}

export function UpdatePasswordForm({ onCancel, onSave, customerInfo, modal }: UpdatePasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const { mobile } = useBreakpoints();
  const [recoverPassword] = useRecoverPasswordMutation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<UpdatePasswordFormData>({
    mode: 'all', // 实时验证，类似reviews-form
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const validationRules = {
    oldPassword: {
      required: 'There is a mandatory field',
    },
    newPassword: {
      required: 'There is a mandatory field',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters in length',
      },
      validate: {
        format: (value: string) => {
          if (!value) return true;
          if (value.length < 8) return true;

          const hasLowercase = /[a-z]/.test(value);
          const hasUppercase = /[A-Z]/.test(value);
          const hasDigit = /\d/.test(value);

          if (!hasLowercase || !hasUppercase || !hasDigit) {
            return 'Password must contain lowercase and upper case characters, and digits';
          }
          return true;
        },
        differentFromOld: (value: string) => {
          const oldPassword = watch('oldPassword');
          if (value && oldPassword && value === oldPassword) {
            return 'New password cannot be the same as old password';
          }
          return true;
        },
      },
    },
    confirmNewPassword: {
      required: 'There is a mandatory field', // PRD 规则 1
      validate: (value: string) => {
        if (!value) return true; // 空值由 required 处理
        return value === newPassword || 'Passwords do not match'; // PRD 规则 6
      },
    },
  };

  const newPassword = watch('newPassword');

  const onSubmit = async (formData: UpdatePasswordFormData) => {
    const { oldPassword, newPassword } = formData;

    const userData = {
      new_password: encryptPassword(newPassword),
      password: encryptPassword(oldPassword),
      version: 1,
    };
    try {
      setLoading(true);
      const res: any = await onSave({ userData, msg: 'Your password has been updated!' });
      if (!res?.data?.errors) {
        onCancel();
      }
    } catch (error: any) {
      logger.error('Failed to update password', {
        error,
        userId: userData.id,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    await recoverPassword({ email: customerInfo?.email || '', from_email: false });
    modal.success({
      title: 'We’ve emailed you a reset link',
      desc: (
        <>
          A link to reset your password has been sent to <b>{customerInfo?.email}</b>
        </>
      ),
      showCancelBtn: false,
      confirmText: 'CLOSE',
    });
  };

  const handleCancel = () => {
    // 类似edit-detail的取消逻辑
    if (isDirty) {
      // 这里可以添加确认逻辑，但现在直接取消
      reset();
      onCancel();
    } else {
      reset();
      onCancel();
    }
  };

  return (
    <Box>
      <Typography level="h1" sx={{ mb: 6 }}>
        Update Password
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr', // 手机端
              sm: '1fr 1fr',
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
            '& .MuiFormControl-root': {
              marginTop: 'auto',
              overflow: 'hidden',
              paddingBottom: 5,
              '.form-helper-text-container': { bottom: 0 },
            },
          }}
        >
          {/* Old Password - 独占一行 */}
          <Controller
            name="oldPassword"
            control={control}
            rules={validationRules.oldPassword}
            render={({ field }) => (
              <FormControl required error={!!errors.oldPassword}>
                <FormLabel>Old Password</FormLabel>
                <Input
                  {...field}
                  variant="borderplain"
                  type="password"
                  placeholder="Enter Old Password"
                  error={!!errors.oldPassword}
                />
                {errors.oldPassword && <FormHelperText>{errors.oldPassword.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: {
                xs: 4,
              },
            }}
          >
            <Link
              variant="primary"
              onClick={() => {
                modal.warning({
                  confirmText: 'SEND LINK',
                  title: 'Reset Password',
                  desc: (
                    <>
                      We will send a link to <b>{customerInfo?.email}</b> for you to reset your password.
                    </>
                  ),
                  onConfirm: handleRecoverPassword,
                });
              }}
            >
              Forgot password
            </Link>
          </Box>

          <Controller
            name="newPassword"
            control={control}
            rules={validationRules.newPassword}
            render={({ field }) => (
              <FormControl required error={!!errors.newPassword}>
                <FormLabel>New Password</FormLabel>
                <Input
                  {...field}
                  variant="borderplain"
                  type="password"
                  placeholder="Enter New Password"
                  error={!!errors.newPassword}
                />
                {errors.newPassword && <FormHelperText>{errors.newPassword.message}</FormHelperText>}
              </FormControl>
            )}
          />

          {/* Confirm New Password - 右侧 */}
          <Controller
            name="confirmNewPassword"
            control={control}
            rules={validationRules.confirmNewPassword}
            render={({ field }) => (
              <FormControl required error={!!errors.confirmNewPassword}>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  {...field}
                  variant="borderplain"
                  type="password"
                  placeholder="Confirm New Password"
                  error={!!errors.confirmNewPassword}
                />
                {errors.confirmNewPassword && <FormHelperText>{errors.confirmNewPassword.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Box>
        <Stack direction={mobile ? 'column-reverse' : 'row'} spacing={mobile ? 4 : 6} sx={{ mt: 14 }}>
          <Button variant="outlined" color="neutral" onClick={handleCancel} disabled={loading}>
            BACK
          </Button>
          <Button type="submit" color="primary" loading={loading}>
            UPDATE PASSWORD
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
