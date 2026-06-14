import { Sheet, Typography, Box } from '@mui/joy';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['plain', 'soft', 'outlined', 'solid'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'neutral', 'danger', 'success', 'warning'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

const SampleContent = () => (
  <Box sx={{ p: 3 }}>
    <Typography level="h4" sx={{ mb: 2 }}>
      Sheet Example
    </Typography>
  </Box>
);

export const Solid: Story = {
  args: {
    variant: 'solid',
    color: 'primary',
  },
  render: (args) => (
    <Sheet {...args} sx={{ width: 400, height: 400, borderRadius: 'md' }}>
      <SampleContent />
    </Sheet>
  ),
};

export const Soft: Story = {
  args: {
    variant: 'soft',
    color: 'primary',
  },
  render: (args) => (
    <Sheet {...args} sx={{ width: 400, height: 400, borderRadius: 'md' }}>
      <SampleContent />
    </Sheet>
  ),
};
