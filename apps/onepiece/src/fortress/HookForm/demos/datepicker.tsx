import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Box, Typography, Button, HookForm, type FormProps } from 'fortress';

export const DatePickerStory: StoryObj<FormProps> = {
  args: {
    form: [
      {
        key: 'date',
        label: 'Delivery Date',
        type: 'datePicker',
        subType: 'date',
        placeholder: 'DD MM YYYY',
        joyProps: {
          variant: 'outlined',
          color: 'neutral',
        },
        disabledDateIntervals: {
          range: [{ start: new Date('2024-02-06'), end: new Date('2024-02-08') }],
        },
        calendarHeaderTitle: 'Schedule Your Delivery',
        calendarHeaderDesc:
          'Delivery date confirmation is subject to the availability of our delivery partners. We will sent out an SMS and Email with a delivery link closer to your chosen dates for you to select the actual delivery date and timeslot.',
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
        key: 'birth',
        type: 'datePicker',
        subType: 'yearMonth',
        label: 'Date of Birth',
        placeholder: 'MMM YYYY',
        joyProps: {
          color: 'neutral',
          variant: 'soft',
        },
        // disabledDates: [new Date('2025-01-03'), new Date('2025-01-09')],
        disabledDateIntervals: {
          // before: new Date('2022-12-03'),
          after: new Date('2025-01-12'),
          // range: [{ start: new Date('2023-12-05'), end: new Date('2023-12-10') }],
        },
        defaultStartDate: new Date('1995-01-01'),
      },
    ],
    validators: {},
    formSxProps: {
      display: 'grid',
      gap: 6,
    },
  },
  render: ({ ...args }) => {
    return (
      <Box sx={{ width: 900, margin: 5 }}>
        <Typography level="h2" textAlign={'center'} sx={{ mb: 6 }}>
          DatePicker
        </Typography>
        <HookForm {...args}>
          <Button type="submit" color="neutral" sx={{ width: '100%', marginY: (theme) => theme.spacing(10) }}>
            Submit
          </Button>
        </HookForm>
      </Box>
    );
  },
};
