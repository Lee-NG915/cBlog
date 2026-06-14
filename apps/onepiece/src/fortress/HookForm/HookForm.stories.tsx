// HookForm.stories.ts|tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Button, HookForm, type FormProps } from 'fortress';
import { form, defaultFetcher, submit } from './mock/formData';
import { validators } from './mock/validators';
import type { ColorPaletteProp } from '@mui/joy';
import type { OverridableStringUnion } from '@mui/types';
import { FormFillStory } from './demos/formfill';
import { DatePickerStory } from './demos/datepicker';
import { DropDownStory } from './demos/dropdown';

const restFormProps: Omit<FormProps, 'form'> = {
  validators,
  defaultFetcher,
  submit,
  formSxProps: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'flex-end',
    rowGap: 4,
    columnGap: 6,
  },
};

interface renderFormProps extends FormProps {
  color?: OverridableStringUnion<ColorPaletteProp> | undefined;
  variant?: any;
}
const renderForm = ({ color, variant, ...args }: renderFormProps) => (
  <Box
    sx={{
      maxWidth: 1400,
      minHeight: 600,
      padding: (theme: any) => theme.spacing(6),
    }}
  >
    <Typography level="subh1" sx={{ textAlign: 'center' }}>
      Hook Form Demo : FormFill + Dropdown + Checkbox + DatePicker
    </Typography>
    <br />
    <HookForm {...args}>
      <Button
        type="submit"
        color={color}
        variant={variant}
        sx={{ width: '100%', marginY: (theme) => theme.spacing(10) }}
      >
        Submit
      </Button>
    </HookForm>
  </Box>
);
export const FormFill = FormFillStory;
export const DropDown = DropDownStory;
export const DatePicker = DatePickerStory;
export const borderPlain: StoryObj<FormProps> = {
  args: {
    form: form({ variant: 'borderplain' }),
    ...restFormProps,
  },
  parameters: {},
  render: (args) => renderForm({ ...args, variant: 'borderplain' }),
};
export const PrimaryOutlined: StoryObj<FormProps> = {
  args: {
    form: form({ color: 'primary', variant: 'outlined' }),
    ...restFormProps,
  },
  parameters: {},
  render: (args) => renderForm({ ...args, color: 'primary', variant: 'outlined' }),
};
export const NeutralSoft: StoryObj<FormProps> = {
  args: {
    form: form({ color: 'neutral', variant: 'soft' }),
    ...restFormProps,
  },
  parameters: {},
  render: (args) => renderForm({ ...args, color: 'neutral', variant: 'soft' }),
};
export const NeutralSolid: StoryObj<FormProps> = {
  args: {
    form: form({ color: 'neutral', variant: 'solid' }),
    ...restFormProps,
  },
  parameters: {},
  render: (args) => renderForm({ ...args, color: 'neutral', variant: 'solid' }),
};

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/HookForm',
  component: HookForm,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/DLa4evU2Vmlkgn5VRvLY4i/%5BR%5D-2023-Q2-Quick-Wins?type=design&node-id=703-2999&mode=design&t=ZnNluKI1REmZPiaa-0',
    },
  },
} as Meta<FormProps>;
export default meta;
