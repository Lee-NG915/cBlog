import type { Meta, StoryObj } from '@storybook/react';
import { OptionSelector, OptionSelectorProps } from './option-selector';
import { Box } from '@castlery/fortress';

const meta: Meta<typeof OptionSelector> = {
  title: 'Components/OptionSelector',
  component: OptionSelector,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onSelect: { action: 'selected' },
    maxDisplay: {
      control: { type: 'number', min: 1, max: 10 },
    },
    size: {
      control: { type: 'number', min: 16, max: 48 },
    },
    showAdditionalCount: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OptionSelector>;

// Mock data for different scenarios
const colorOptions = [
  {
    id: 'color-1',
    value: 'creamy_white',
    label: 'Creamy White',
    image: 'https://d1qikdlbmwrjn6.cloudfront.net/knight-color-tone/creamy_white-tone.jpg',
    isSelected: true,
  },
  {
    id: 'color-2',
    value: 'charcoal',
    label: 'Charcoal',
    image: 'https://d1qikdlbmwrjn6.cloudfront.net/knight-color-tone/charcoal-tone.jpg',
    isSelected: false,
  },
  {
    id: 'color-3',
    value: 'sage_green',
    label: 'Sage Green',
    image: 'https://d1qikdlbmwrjn6.cloudfront.net/knight-color-tone/sage_green-tone.jpg',
    isSelected: false,
  },
  {
    id: 'color-4',
    value: 'navy',
    label: 'Navy',
    image: 'https://d1qikdlbmwrjn6.cloudfront.net/knight-color-tone/navy-tone.jpg',
    isSelected: false,
  },
  {
    id: 'color-5',
    value: 'rust',
    label: 'Rust',
    image: 'https://d1qikdlbmwrjn6.cloudfront.net/knight-color-tone/rust-tone.jpg',
    isSelected: false,
  },
];

const materialOptions = [
  {
    id: 'material-1',
    value: 'leather',
    label: 'Leather',
    isSelected: true,
  },
  {
    id: 'material-2',
    value: 'fabric',
    label: 'Fabric',
    isSelected: false,
  },
  {
    id: 'material-3',
    value: 'velvet',
    label: 'Velvet',
    isSelected: false,
  },
];

export const ColorVariants: Story = {
  args: {
    options: colorOptions,
    maxDisplay: 3,
    size: 24,
    showAdditionalCount: true,
  },
  render: (args) => (
    <Box sx={{ p: 3 }}>
      <h3>Color Options with Images</h3>
      <OptionSelector {...args} />
    </Box>
  ),
};

export const MaterialVariants: Story = {
  args: {
    options: materialOptions,
    maxDisplay: 3,
    size: 24,
    showAdditionalCount: true,
  },
  render: (args) => (
    <Box sx={{ p: 3 }}>
      <h3>Material Options without Images</h3>
      <OptionSelector {...args} />
    </Box>
  ),
};

export const LargeSize: Story = {
  args: {
    options: colorOptions.slice(0, 3),
    maxDisplay: 3,
    size: 32,
    showAdditionalCount: false,
  },
  render: (args) => (
    <Box sx={{ p: 3 }}>
      <h3>Large Size (32px)</h3>
      <OptionSelector {...args} />
    </Box>
  ),
};

export const SmallSize: Story = {
  args: {
    options: colorOptions.slice(0, 3),
    maxDisplay: 3,
    size: 20,
    showAdditionalCount: false,
  },
  render: (args) => (
    <Box sx={{ p: 3 }}>
      <h3>Small Size (20px)</h3>
      <OptionSelector {...args} />
    </Box>
  ),
};

export const WithLimitedDisplay: Story = {
  args: {
    options: colorOptions,
    maxDisplay: 2,
    size: 24,
    showAdditionalCount: true,
  },
  render: (args) => (
    <Box sx={{ p: 3 }}>
      <h3>Limited Display (2 options + count)</h3>
      <OptionSelector {...args} />
    </Box>
  ),
};

export const NoAdditionalCount: Story = {
  args: {
    options: colorOptions,
    maxDisplay: 2,
    size: 24,
    showAdditionalCount: false,
  },
  render: (args) => (
    <Box sx={{ p: 3 }}>
      <h3>No Additional Count Text</h3>
      <OptionSelector {...args} />
    </Box>
  ),
};

export const DifferentSelections: Story = {
  render: () => (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div>
        <h4>First Option Selected</h4>
        <OptionSelector options={colorOptions.map((opt, i) => ({ ...opt, isSelected: i === 0 }))} onSelect={() => {}} />
      </div>
      <div>
        <h4>Second Option Selected</h4>
        <OptionSelector options={colorOptions.map((opt, i) => ({ ...opt, isSelected: i === 1 }))} onSelect={() => {}} />
      </div>
      <div>
        <h4>No Selection</h4>
        <OptionSelector options={colorOptions.map((opt) => ({ ...opt, isSelected: false }))} onSelect={() => {}} />
      </div>
    </Box>
  ),
};

export const SingleOption: Story = {
  args: {
    options: [colorOptions[0]],
    onSelect: () => {},
  },
  render: (args) => (
    <Box sx={{ p: 3 }}>
      <h3>Single Option (Should not render)</h3>
      <OptionSelector {...args} />
      <p style={{ fontStyle: 'italic', color: '#666' }}>Component should not render when there's only one option</p>
    </Box>
  ),
};
