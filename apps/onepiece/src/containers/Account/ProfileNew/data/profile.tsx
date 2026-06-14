import React from 'react';
import type { FormData } from '@castlery/fortress/HookForm/types';
import { CalendarMonth } from '@castlery/fortress/Icons';
import { getOptions } from './selectOptions';
import { SubH2Title } from '../Titles';
import { Typography } from '@castlery/fortress';

const options = getOptions(__COUNTRY__);
export const tipText =
  'Help us understand you and your home better, so we can design a shopping experience you love, products which fit in your home and communications you care about. The personal information you share with us will be kept confidential and will only be used within Castlery. You can read about our privacy policy';

export const form: (isMobile: boolean, hasBirthday: boolean, defaultBirth?: Date) => FormData = (
  isMobile,
  hasBirthday,
  defaultBirth
) => [
  {
    key: 'birthday',
    type: 'datePicker',
    subType: 'yearMonth',
    label: 'Date of Birth',
    insertReactNode: () => <SubH2Title>About Me</SubH2Title>,
    defaultStartDate: defaultBirth,
    disabledDateIntervals: {
      after: new Date(),
    },
    joyProps: {
      endDecorator: <CalendarMonth />,
      disabled: hasBirthday,
    },
    appendReactNode: () => {
      return (
        <Typography
          sx={{
            marginTop: 3,
            fontSize: '14px',
            color: (theme) => theme.palette.brand.charcoal[500],
          }}
        >
          {hasBirthday ? 'Note: Birth date cannot be modified.' : '*Note: Once saved, this date cannot be modified'}
        </Typography>
      );
    },
  },
  {
    key: 'occupation',
    type: 'select',
    subType: 'single',
    label: 'Occupation',

    options: options.occupation,
    joyProps: {
      slotProps: {
        button: {
          sx: {
            maxWidth: isMobile ? '80vw' : '30vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    appendReactNode: () => {
      if (isMobile) {
        return null;
      }
      return (
        <Typography
          sx={{
            marginTop: 3,
            fontSize: '14px',
            color: 'transparent',
            userSelect: 'none',
          }}
        >
          *Note: Once saved, this date cannot be modified
        </Typography>
      );
    },
    optionJoyProps: {
      sx: {
        maxWidth: isMobile ? '90vw' : 'auto',
        overflow: 'hidden',
      },
    },
  },
  {
    key: 'housing_type',
    type: 'select',
    subType: 'single',
    label: 'Housing type',
    insertReactNode: () => <SubH2Title>About My Home</SubH2Title>,
    options: options.housing_type,
  },
  {
    key: 'home_size',
    type: 'select',
    subType: 'single',
    label: 'What is the approximate size of your home?',
    options: options.home_size,
  },
  {
    key: 'most_time_spent_location',
    type: 'select',
    subType: 'single',
    label: 'Where do you spend the most time in your home?',
    options: options.most_time_spent_location,
  },
  {
    key: 'annual_household_income',
    type: 'select',
    subType: 'single',
    label: 'Annual Household Income',
    options: options.annual_household_income,
  },
];
export const validators = {
  birthday: { required: true },
  occupation: { required: true },
  housing_type: { required: true },
  home_size: { required: true },
  most_time_spent_location: { required: true },
  annual_household_income: { required: true },
};
