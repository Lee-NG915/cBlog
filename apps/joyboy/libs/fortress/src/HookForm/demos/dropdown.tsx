import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Box, Typography, Button } from '../../index';
import { HookForm, type FormProps } from '../index';

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
          variant: 'sort',
          // slotProps: {
          //   button: {
          //     sx: {
          //       justifyContent: 'flex-start',
          //       WebkitJustifyContent: 'flex-start',
          //     },
          //   },
          // },
        },
        optionJoyProps: {
          variant: 'sort',
        },
      },
      {
        key: 'gender2',
        type: 'select',
        subType: 'multiple',
        label: 'Gender',
        placeholder: '',
        options: [
          { label: 'Female', value: 1 },
          { label: 'Male', value: 2 },
          { label: 'Secret', value: 3 },
        ],
        joyProps: {
          variant: 'form',
        },
        optionJoyProps: {
          variant: 'form',
          sx: {
            justifyContent: 'center',
          },
        },
      },
    ],
    validators: {
      gender2: {
        required: true,
      },
    },
    formSxProps: {
      display: 'grid',
      gap: 6,
    },
    defaultFetcher: {},
  },
  render: ({ ...args }) => {
    return (
      <Box sx={{ width: 900, margin: 5 }}>
        <Typography level="h2" textAlign={'center'} sx={{ mb: 6 }}>
          Dropdown
        </Typography>
        <HookForm {...args}>
          <Button type="submit" sx={{ width: '50%', mt: 10 }}>
            Submit
          </Button>
        </HookForm>
      </Box>
    );
  },
};
