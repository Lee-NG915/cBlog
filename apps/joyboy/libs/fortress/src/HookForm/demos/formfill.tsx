import React from 'react';
import type { StoryObj } from '@storybook/react';
import { HelpFilled, Search, Mail, Edit, ListAlt } from '../../Icons';
import { Box, Typography, Button } from '../../index';
import { HookForm, type FormProps } from '../index';

export const FormFillStory: StoryObj<FormProps> = {
  args: {
    form: [
      {
        key: 'mobile_sg',
        type: 'input',
        subType: 'text',
        label: 'Mobile(SG)',
        joyProps: {
          color: 'neutral',
          variant: 'outlined',
        },
      },
      {
        key: 'filter',
        type: 'input',
        subType: 'text',
        label: 'Search',
        placeholder: 'Search',
        joyProps: {
          color: 'neutral',
          variant: 'outlined',
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
        key: 'mobile_us',
        type: 'input',
        subType: 'text',
        label: 'Mobile(US)',
        placeholder: 'Place input your phone number here ~',
        joyProps: {},
      },
      {
        key: 'email',
        type: 'input',
        subType: 'email',
        label: 'Email',
        joyProps: {
          // @ts-ignore
          startDecorator: <Mail sx={{ color: (theme) => theme.palette.brand.charcoal[500] }} />,
          endDecorator: <Edit sx={{ color: (theme) => theme.palette.brand.charcoal[500] }} />,
        },
      },
      {
        key: 'password',
        type: 'input',
        subType: 'password',
        label: 'Password',
        joyProps: {
          color: 'neutral',
        },
      },
      {
        key: 'remark',
        type: 'input',
        subType: 'text',
        label: 'Remark',
        joyProps: {
          color: 'neutral',
          // @ts-ignore
          endDecorator: <ListAlt sx={{ color: (theme) => theme.palette.brand.charcoal[500] }} />,
        },
      },
    ],
    validators: {
      mobile_sg: {
        required: true,
        validator: 'phoneSG',
      },
      mobile_us: {
        validator: 'phoneUS',
      },
    },
    formSxProps: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
    },
    defaultFetcher: {
      mobile_sg: '+6512345678',
      password: '12345678',
      email: '123456@gmail.com',
    },
    submit: (values) => {
      alert(`Form Values :` + JSON.stringify(values));
    },
  },
  parameters: {},
  render: (args) => {
    return (
      <Box sx={{ margin: 5 }}>
        <Typography level="h2" textAlign={'center'} sx={{ mb: 6 }}>
          Form Fill
        </Typography>
        <HookForm {...args}>
          <Button type="submit" sx={{ width: '100%', marginY: (theme: any) => theme.spacing(10) }}>
            Submit
          </Button>
        </HookForm>
      </Box>
    );
  },
};
