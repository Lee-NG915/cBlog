import type { Meta, StoryObj } from '@storybook/react';
import { RadioButton } from './RadioButton';
import { Radio, Stack, Typography } from '@mui/joy';
import RadioGroup from '@mui/joy/RadioGroup';

const meta: Meta<typeof RadioButton> = {
  title: 'Components/Radiobutton',
  component: RadioButton,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Option 1',
    value: 'option1',
    name: 'radio-group',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2} alignItems="center">
      <Typography level="h4">RadioButton Sizes</Typography>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <RadioButton label="Small" size="sm" value="small" name="size-group" />
        <RadioButton label="Medium" size="md" value="medium" name="size-group" />
        <RadioButton label="Large" size="lg" value="large" name="size-group" />
      </Stack>
    </Stack>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <Stack spacing={3} alignItems="center">
      <Typography level="h4">RadioButton with RadioGroup</Typography>
      <RadioGroup name="size-options" defaultValue="medium">
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <RadioButton label="Small" size="sm" value="small" />
          <RadioButton label="Medium" size="md" value="medium" />
          <RadioButton label="Large" size="lg" value="large" />
        </Stack>
      </RadioGroup>
    </Stack>
  ),
};
