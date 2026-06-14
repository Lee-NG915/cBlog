import { FormHelperTextProps } from './FormHelperText';
import { FormHelperText } from '../FormHelperText';
import type { Meta, StoryObj } from '@storybook/react';
import { FormControl, FormLabel } from '../Form';
import { Input } from '../Input';
const meta = {
  title: 'Components/Formhelpertext',
  component: FormHelperText,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
  argTypes: {},
} as Meta<FormHelperTextProps>;

export default meta;

type Story = StoryObj<FormHelperTextProps>;

export const Primary: Story = {
  render: () => (
    <>
      <FormControl>
        <FormLabel>Form Label</FormLabel>
        <Input />
        <FormHelperText>Helper Text</FormHelperText>
      </FormControl>
    </>
  ),
};

export const ErrorFormHelperText: Story = {
  render: () => (
    <FormControl error>
      <FormLabel>Form Label</FormLabel>
      <Input />
      <FormHelperText>Error Message</FormHelperText>
    </FormControl>
  ),
};
