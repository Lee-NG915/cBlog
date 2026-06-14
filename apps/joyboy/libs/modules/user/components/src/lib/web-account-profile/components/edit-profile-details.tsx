'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Input,
  Stack,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  DatePicker,
  Dropdown,
  DropdownOption,
  useBreakpoints,
  Link,
} from '@castlery/fortress';
import { CalendarMonth } from '@castlery/fortress/Icons';
import { useForm, Controller } from 'react-hook-form';
import { logger } from '@castlery/observability/client';
import { User } from '@castlery/types';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { toFormZonedTime } from '@castlery/utils';
import { EcEnv } from '@castlery/config';

interface EditProfileFormData {
  dateOfBirth: Date | undefined;
  housingType: string;
  homeSize: string;
  budgetAndFinances: string;
  homeOwnership: string;
  householdSize: string;
  householdStructure: string[];
}

export interface SubmitProfileFormData {
  birthday?: string;
  housing_type: string;
  home_size: string;
  annual_household_income: string;
  home_ownership: string;
  household_size: string;
  household_structure: string[];
}

interface EditProfileDetailsProps {
  data: User | null;
  onCancel: () => void;
  modal: any;
  onSave: (data: { profile_attributes: SubmitProfileFormData; msg: string }) => void;
}

export function EditProfileDetails({ data, onCancel, onSave, modal }: EditProfileDetailsProps) {
  const [loading, setLoading] = useState(false);
  const { mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_USER, {
    keyPrefix: 'editProfileOption',
  });

  const hasBirthday = data?.profile?.birthday !== '';
  const hasHouseholdStructure =
    Array.isArray(data?.profile?.household_structure) && data?.profile?.household_structure.length > 0;

  // console.log('profile---------------------------->', data?.profile);
  // console.log('hasHouseholdStructure---------------------------->', hasHouseholdStructure);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm<EditProfileFormData>({
    mode: 'onSubmit',
    defaultValues: {
      dateOfBirth: data?.profile?.birthday ? new Date(data.profile.birthday) : undefined,
      housingType: data?.profile?.housing_type || '',
      homeSize: data?.profile?.home_size || '',
      budgetAndFinances: data?.profile?.annual_household_income || '',
      homeOwnership: data?.profile?.home_ownership || '',
      householdSize: data?.profile?.household_size || '',
      householdStructure: Array.isArray(data?.profile?.household_structure) ? data?.profile?.household_structure : [],
    },
  });

  // 验证规则定义 - 类似reviews-form中注释掉的validationRules
  const validationRules = {
    dateOfBirth: {
      required: 'There is a mandatory field',
      validate: (value: Date | undefined) => {
        const today = new Date();
        if (value && value > today) {
          return 'Birth date cannot be in the future';
        }
        return true;
      },
    },
    housingType: {
      required: 'There is a mandatory field',
    },
    homeSize: {
      required: 'There is a mandatory field',
    },
    budgetAndFinances: {
      required: 'There is a mandatory field',
    },
    homeOwnership: {
      required: 'There is a mandatory field',
    },
    householdSize: {
      required: 'There is a mandatory field',
    },
    householdStructure: {
      required: 'There is a mandatory field',
    },
  };

  useEffect(() => {
    if (data) {
      reset({
        dateOfBirth: data.profile?.birthday ? new Date(data.profile.birthday) : undefined,
        housingType: data.profile?.housing_type || '',
        homeSize: data.profile?.home_size || '',
        budgetAndFinances: data.profile?.annual_household_income || '',
        homeOwnership: data.profile?.home_ownership || '',
        householdSize: data.profile?.household_size || '',
        householdStructure: Array.isArray(data.profile?.household_structure) ? data.profile?.household_structure : [],
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: EditProfileFormData) => {
    try {
      setLoading(true);
      const formattedData: SubmitProfileFormData = {
        housing_type: formData.housingType,
        home_size: formData.homeSize,
        annual_household_income: formData.budgetAndFinances,
        home_ownership: formData.homeOwnership,
        household_size: formData.householdSize,
        household_structure: formData.householdStructure,
      };

      if (!hasBirthday && formData.dateOfBirth) {
        modal.danger({
          title: 'Please note that once you confirm your birth date, it cannot be changed later.',
          cancelText: 'Cancel',
          confirmText: 'Confirm',
          onConfirm: async () => {
            formattedData.birthday = toFormZonedTime(formData.dateOfBirth as Date).toISOString();
            await onSave({
              profile_attributes: formattedData,
              msg: 'Profile details updated! 20 credits have been added to your account.',
            });
            onCancel();
          },
        });
      } else {
        if (!hasHouseholdStructure && formData.householdStructure.length > 0) {
          onSave({
            profile_attributes: formattedData,
            msg: 'Profile details updated! 20 credits have been added to your account.',
          });
        } else {
          onSave({
            profile_attributes: formattedData,
            msg: 'Profile updated!',
          });
        }

        onCancel();
      }
    } catch (error) {
      logger.error('Failed to save profile details', {
        error,
        userId: formData,
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
      <Typography level="h1">Edit Profile Details</Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: 'grid',
            overflow: 'hidden',
            '& .MuiFormControl-root': {
              marginTop: 'auto',
              paddingBottom: 5,
              overflow: 'hidden',
              '.form-helper-text-container': { bottom: 0 },
            },
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1fr',
            },
            gap: {
              xs: 3,
              sm: 4,
              md: 4,
            },
            rowGap: {
              xs: 1,
              sm: 2,
              md: 2,
            },
            '& .section-title': {
              gridColumn: {
                xs: '1',
                lg: '1 / -1', // 跨所有列
              },
              mt: {
                // xs: 3,
                sm: 2,
              },
            },
            '& .form-buttons': {
              gridColumn: {
                xs: '1',
                lg: '1 / -1', // 跨所有列
              },
              mt: 4,
            },
          }}
        >
          <Typography level="subh2" className="section-title" sx={{ mt: 6 }}>
            about me
          </Typography>
          <Controller
            name="dateOfBirth"
            control={control}
            rules={validationRules.dateOfBirth}
            render={({ field }) => (
              <FormControl required disabled={hasBirthday} error={!!errors.dateOfBirth}>
                <FormLabel>Date of birth</FormLabel>
                <DatePicker
                  mode="ym"
                  selected={field.value}
                  onSelect={(date: Date) => {
                    field.onChange(date);
                  }}
                  end={new Date()} // 不能选择未来日期
                  actionComponent={({ ref }) => (
                    <Input
                      ref={ref as React.RefObject<HTMLInputElement>}
                      variant="borderplain"
                      placeholder="Select Date of Birth"
                      value={
                        field.value
                          ? `${field.value.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
                          : ''
                      }
                      error={!!errors.dateOfBirth}
                      endDecorator={<CalendarMonth />}
                      readOnly
                      tabIndex={0}
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
                {errors.dateOfBirth ? (
                  <FormHelperText>{errors.dateOfBirth.message}</FormHelperText>
                ) : (
                  <>
                    <FormHelperText>Note: Once saved, this cannot be modified</FormHelperText>
                  </>
                )}
              </FormControl>
            )}
          />

          {/* Section Title: About My Home */}
          <Typography level="subh2" className="section-title" sx={{}}>
            about my home
          </Typography>
          <Controller
            name="housingType"
            control={control}
            rules={validationRules.housingType}
            render={({ field }) => (
              <FormControl required error={!!errors.housingType} sx={{}}>
                <FormLabel>Housing type</FormLabel>
                <Dropdown
                  {...field}
                  variant="borderplain"
                  placeholder="Select Housing Type"
                  onChange={(_, value) => field.onChange(value)}
                >
                  {t('housingType').map((option: string) => (
                    <DropdownOption key={option} value={option} sx={{ width: 'inherit' }}>
                      {option}
                    </DropdownOption>
                  ))}
                </Dropdown>
                {errors.housingType && <FormHelperText>{errors.housingType.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="homeSize"
            control={control}
            rules={validationRules.homeSize}
            render={({ field }) => (
              <FormControl required error={!!errors.homeSize}>
                <FormLabel>What is the approximate size of your home?</FormLabel>
                <Dropdown
                  {...field}
                  variant="borderplain"
                  placeholder="Select Approximate Size"
                  onChange={(_, value) => field.onChange(value)}
                >
                  {t('homeSize').map((option: string) => (
                    <DropdownOption key={option} value={option} sx={{ width: 'inherit' }}>
                      {option}
                    </DropdownOption>
                  ))}
                </Dropdown>
                {errors.homeSize && <FormHelperText>{errors.homeSize.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="budgetAndFinances"
            control={control}
            rules={validationRules.budgetAndFinances}
            render={({ field }) => (
              <FormControl required error={!!errors.budgetAndFinances}>
                <FormLabel>Annual household income</FormLabel>
                <Dropdown
                  {...field}
                  variant="borderplain"
                  placeholder="Select Household Income"
                  onChange={(_, value) => field.onChange(value)}
                >
                  {t('annualHouseholdIncome').map((option: string) => (
                    <DropdownOption key={option} value={option} sx={{ width: 'inherit' }}>
                      {option}
                    </DropdownOption>
                  ))}
                </Dropdown>
                {errors.budgetAndFinances && <FormHelperText>{errors.budgetAndFinances.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="homeOwnership"
            control={control}
            rules={validationRules.homeOwnership}
            render={({ field }) => (
              <FormControl required error={!!errors.homeOwnership}>
                <FormLabel>Home ownership</FormLabel>
                <Dropdown
                  {...field}
                  variant="borderplain"
                  placeholder="Select Home Ownership"
                  onChange={(_, value) => field.onChange(value)}
                >
                  {t('homeOwnership').map((option: string) => (
                    <DropdownOption key={option} value={option} sx={{ width: 'inherit' }}>
                      {option}
                    </DropdownOption>
                  ))}
                </Dropdown>
                {errors.homeOwnership && <FormHelperText>{errors.homeOwnership.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="householdSize"
            control={control}
            rules={validationRules.householdSize}
            render={({ field }) => (
              <FormControl required error={!!errors.householdSize}>
                <FormLabel>Including yourself, how many people live in your current home?</FormLabel>
                <Dropdown
                  {...field}
                  variant="borderplain"
                  placeholder="Select Household Size"
                  onChange={(_, value) => {
                    field.onChange(value);
                    const householdStructure = getValues('householdStructure');

                    if (
                      value === 'Just myself' &&
                      householdStructure.length > 0 &&
                      householdStructure.find((item: string) => item !== 'Pet/s' && item !== 'Other')
                    ) {
                      setValue('householdStructure', []);
                    }
                  }}
                >
                  {t('householdSize').map((option: string) => (
                    <DropdownOption key={option} value={option} sx={{ width: 'inherit' }}>
                      {option}
                    </DropdownOption>
                  ))}
                </Dropdown>
                {errors.householdSize && <FormHelperText>{errors.householdSize.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="householdStructure"
            control={control}
            rules={validationRules.householdStructure}
            render={({ field }) => {
              const householdSize = watch('householdSize');
              const householdStructureList =
                householdSize === 'Just myself' ? ['Pet/s', 'Other'] : t('householdStructure');

              return (
                <FormControl required error={!!errors.householdStructure}>
                  <FormLabel>Who do you live with? (Select all that apply)</FormLabel>
                  <Dropdown
                    {...field}
                    multiple
                    variant="borderplain"
                    placeholder="Select Household Structure"
                    onChange={(_, value) => field.onChange(value)}
                    renderValue={(selected: any) => {
                      const selectedOptions = selected?.map((item: any) => item.label);
                      return (
                        <Typography
                          level="body2"
                          sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                        >
                          {selectedOptions?.join(', ')}
                        </Typography>
                      );
                    }}
                  >
                    {householdStructureList.map((option: string) => (
                      <DropdownOption key={option} value={option} sx={{ width: 'inherit' }}>
                        {option}
                      </DropdownOption>
                    ))}
                  </Dropdown>
                  {errors.householdStructure && <FormHelperText>{errors.householdStructure.message}</FormHelperText>}
                </FormControl>
              );
            }}
          />

          <Stack direction={mobile ? 'column-reverse' : 'row'} spacing={mobile ? 4 : 6} sx={{ mt: 4 }}>
            <Button variant="outlined" color="neutral" onClick={handleCancel} disabled={loading}>
              BACK
            </Button>
            <Button type="submit" color="primary" disabled={loading} loading={loading}>
              SAVE DETAILS
            </Button>
          </Stack>
        </Box>
      </form>

      <Box sx={{ mt: 4, p: 3, backgroundColor: 'var(--fortress-palette-brand-warmLinen-100)', borderRadius: 1 }}>
        <Typography level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-600)' }}>
          Help us understand you and your home better, so we can design a shopping experience you love, products which
          fit in your home and communications you care about. The personal information you share with us will be kept
          confidential and will only be used within Castlery. You can read about our privacy policy{' '}
          <Link variant="primary" href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/privacy-policy`}>
            here
          </Link>
          .
        </Typography>
      </Box>
    </Box>
  );
}
