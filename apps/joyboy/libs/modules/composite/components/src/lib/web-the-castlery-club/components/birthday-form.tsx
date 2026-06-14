'use client';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  useNiceModal,
  Input,
  DatePicker,
  Typography,
} from '@castlery/fortress';
import { Error, CalendarMonth } from '@castlery/fortress/Icons';
import { selectedProfileLoading } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { logger } from '@castlery/observability/client';

interface BirthdayFormProps {
  onSubmit: (values: Record<string, any>) => Promise<void>;
  isMobile: boolean;
}

interface BirthdayFormData {
  birthday: Date | undefined;
}

export const BirthdayForm = ({ onSubmit, isMobile }: BirthdayFormProps) => {
  const [modal, contextHolder] = useNiceModal();
  const [loading, setLoading] = useState(false);
  const profileLoading = useAppSelector(selectedProfileLoading);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<BirthdayFormData>({
    mode: 'onChange',
    defaultValues: {
      birthday: undefined,
    },
  });

  const formHandleSubmit = async (data: BirthdayFormData) => {
    modal.warning({
      title: 'Please note that once you confirm your birth date, it cannot be changed later.',
      showCancelBtn: true,
      confirmText: 'Confirm',
      onCancel: () => {
        console.log('cancel');
      },
      onConfirm: async () => {
        try {
          setLoading(true);
          // 将 Date 对象转换为完整的 ISO 格式
          const formattedData = {
            ...data,
            birthday: data.birthday?.toISOString(), // 完整的 ISO 格式: 2015-07-01T02:53:11.000Z
          };
          await onSubmit(formattedData);
        } catch (error) {
          logger.error('Failed to submit birthday', { error });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        padding: isMobile ? '12px 16px !important' : undefined,
        '& .Mui-error': {
          color: 'var(--fortress-palette-danger-500)',
        },
      }}
    >
      <form onSubmit={handleSubmit(formHandleSubmit)} style={{ width: '100%' }}>
        <Controller
          name="birthday"
          control={control}
          rules={{
            required: 'Date of Birth is required',
            validate: (value) => {
              if (!value) return 'Date of Birth is required';
              const today = new Date();
              if (value > today) {
                return 'Birth date cannot be in the future';
              }
              return true;
            },
          }}
          render={({ field }) => (
            <FormControl
              required
              sx={{
                gap: 1,
              }}
            >
              <FormLabel sx={{ '--FormLabel-margin': 1 }}>
                <Typography level="body2">Date of Birth</Typography>
              </FormLabel>
              <DatePicker
                mode="ym"
                selected={field.value}
                onSelect={(date: Date) => {
                  field.onChange(date);
                  setTimeout(() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                    if (document.activeElement !== document.body) {
                      document.body.focus();
                    }
                  }, 150); // 稍微增加延迟，确保选择动画完成
                }}
                end={new Date()} // 不能选择未来日期
                actionComponent={({ ref }) => (
                  <Input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    variant="borderplain"
                    placeholder="MM/YYYY"
                    value={
                      field.value
                        ? `${String(field.value.getMonth() + 1).padStart(2, '0')}/${field.value.getFullYear()}`
                        : ''
                    }
                    error={!!errors.birthday}
                    endDecorator={<CalendarMonth />}
                    readOnly
                    tabIndex={0}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      if (ref && 'current' in ref && ref.current) {
                        ref.current.focus();
                      }
                    }}
                    slotProps={{
                      input: {
                        onClick: (e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (ref && 'current' in ref && ref.current) {
                            ref.current.focus();
                          }
                        },
                      },
                    }}
                  />
                )}
              />

              {errors.birthday && (
                <FormHelperText sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Error width={16} height={16} />
                  {errors.birthday.message}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Button
          sx={{ width: '100%', mt: 6, mb: 2 }}
          type="submit"
          loading={profileLoading || loading}
          disabled={!isValid}
        >
          Add My Birthday
        </Button>
      </form>
      {contextHolder}
    </Stack>
  );
};
