import { FormData } from '../types';
import { Typography, Box } from '../../index';
import { occupationOptions } from './selectOptions';
import { HelpFilled, Search } from '../../Icons';
import React from 'react';

export const form = ({ variant, color }: { variant?: string; color?: string }): FormData => [
  {
    key: 'mobile',
    type: 'input',
    subType: 'text',
    label: 'Mobile(SG)',
    joyProps: {
      variant,
      color,
    },
  },
  {
    key: 'filter',
    type: 'input',
    subType: 'text',
    label: 'Search',
    placeholder: 'Search',
    joyProps: {
      variant,
      color,
      // @ts-ignore
      startDecorator: <Search sx={{ color: (theme) => theme.palette.brand.charcoal[500] }} />,
      endDecorator: (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Typography sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}>MM / YY CVV</Typography>
          <HelpFilled sx={{ color: (theme) => theme.palette.brand.charcoal[500], margin: 1 }} />
        </Box>
      ),
    },
  },
  {
    key: 'birth',
    type: 'datePicker',
    subType: 'yearMonth',
    label: 'Date of Birth',
    placeholder: '',
    joyProps: {
      variant,
      color,
    },
    // disabledDates: [new Date('2025-01-03'), new Date('2025-01-09')],
    disabledDateIntervals: {
      // before: new Date('2022-12-03'),
      after: new Date('2025-01-12'),
      // range: [{ start: new Date('2023-12-05'), end: new Date('2023-12-10') }],
    },
    defaultStartDate: new Date('1995-01-01'),
  },
  {
    key: 'date',
    label: 'Delivery Date',
    type: 'datePicker',
    subType: 'date',
    placeholder: 'DD MM YYYY',
    joyProps: {},
    disabledDateIntervals: {
      range: [{ start: new Date('2024-02-06'), end: new Date('2024-02-08') }],
    },
    calendarHeaderTitle: 'Schedule Your Delivery',
    calendarHeaderDesc:
      'Delivery date confirmation is subject to the availability of our delivery partners. We will sent out an SMS and Email with a delivery link closer to your chosen dates for you to select the actual delivery date and timeslot.',
  },
  {
    key: 'occupation',
    type: 'select',
    subType: 'single',
    label: 'Occupation',
    placeholder: '',
    options: occupationOptions,
    joyProps: {
      variant,
      color,
    },
  },
  {
    key: 'gender',
    type: 'select',
    subType: 'single',
    label: 'Gender',
    placeholder: '',
    options: [
      { label: 'Female', value: 0 },
      { label: 'Male', value: 1 },
      { label: 'Secret', value: 2 },
    ],
  },
  {
    key: 'email',
    type: 'checkbox',
    subType: 'checkbox',
    placeholder: 'Confirm subscription to email marketing campaigns .',
    joyProps: {
      variant,
      color,
    },
  },
  {
    key: 'popularProducts',
    type: 'checkbox',
    subType: 'group',
    label: 'What type of products do you often buy?',
    options: [
      { label: 'Sofa', value: 1 },
      { label: 'Chair', value: 2 },
      { label: 'Bed', value: 3 },
      { label: 'Table', value: 4 },
    ],
    joyProps: {
      sx: {
        display: 'flex',
        flexDirection: 'column',
      },
    },
    optionJoyProps: {
      variant,
      color,
      sx: {
        gap: 0.5,
      },
    },
  },
];

// eslint-disable-next-line @typescript-eslint/ban-types
export const submit = (data: {}) => {};

export const defaultFetcher = {
  birth: '',
  occupation: 2,
  mobile: '+6512345678',
  email: true,
};
