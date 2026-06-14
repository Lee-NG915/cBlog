import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Box, Typography, Button, HookForm, type FormProps } from 'fortress';

export const DropDownStory: StoryObj<FormProps> = {
  args: {
    form: [
      {
        key: 'gender',
        type: 'select',
        subType: 'single',
        label: 'Gender',
        placeholder: '',
        options: [
          { label: 'Female', value: 1 },
          { label: 'Male', value: 2 },
          { label: 'Secret', value: 3 },
        ],
        joyProps: {
          variant: 'outlined',
          slotProps: {
            button: {
              sx: {
                justifyContent: 'flex-start',
                '-webkit-justify-content': 'flex-start',
              },
            },
          },
        },
        optionJoyProps: {
          variant: 'borderplain',
        },
      },
      {
        key: 'gender2',
        type: 'select',
        subType: 'single',
        label: 'Gender',
        placeholder: '',
        options: [
          { label: 'Female', value: 1 },
          { label: 'Male', value: 2 },
          { label: 'Secret', value: 3 },
        ],
        joyProps: {
          variant: 'outlined',
        },
        optionJoyProps: {
          variant: 'borderplain',
          sx: {
            justifyContent: 'center',
          },
        },
      },
      {
        key: 'gender1',
        type: 'select',
        subType: 'single',
        label: 'Gender',
        placeholder: '',
        options: [
          { label: 'Female', value: 1 },
          { label: 'Male', value: 2 },
          { label: 'Secret', value: 3 },
        ],
      },
    ],
    validators: {},
    formSxProps: {
      display: 'grid',
      gap: 6,
    },
    defaultFetcher: {
      gender: 1,
      gender2: 2,
      gender1: 3,
    },
  },
  render: ({ ...args }) => {
    return (
      <Box sx={{ width: 900, margin: 5 }}>
        <Typography level="h2" textAlign={'center'} sx={{ mb: 6 }}>
          DatePicker
        </Typography>
        <HookForm {...args}>
          <Button type="submit" sx={{ width: '100%', marginY: (theme) => theme.spacing(10) }}>
            Submit
          </Button>
        </HookForm>
      </Box>
    );
  },
};
