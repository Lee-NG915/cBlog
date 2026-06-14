import Radio from '.';
import type { RadioProps } from '.';
import type { Meta, StoryObj } from '@storybook/react';

import FormControl from '@mui/joy/FormControl';
import RadioGroup from '@mui/joy/RadioGroup';

const meta: Meta<RadioProps> = {
  title: 'fortress/Radio',
  component: Radio,
};
export default meta;

type Story = StoryObj<RadioProps>;

export const Basics: Story = {
  args: {
    label: 'Label',
  },
  parameters: {},
  render: ({ ...args }) => (
    <FormControl>
      <RadioGroup defaultValue="medium" name="radio-buttons-group">
        <Radio value="1" {...args} />
        <Radio value="2" {...args} />
      </RadioGroup>
    </FormControl>
  ),
};
