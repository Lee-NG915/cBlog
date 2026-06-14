/* eslint-disable @typescript-eslint/no-unused-vars */
// Tag.stories.ts|tsx
// import { within, expect } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip, MChipProps } from './index';
import { Sell, Chair } from '../Icons';
import { Stack } from '@mui/joy';
import React from 'react';
import Checkbox from '../Checkbox';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    // version: 'v2',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=74%3A275&mode=dev',
    },
  },
} as Meta<MChipProps>;
export default meta;

type Story = StoryObj<MChipProps>;

export const Default: Story = {
  render: () => {
    return <Chip>Default</Chip>;
  },
};

export const Solid: Story = {
  render: () => {
    return (
      <>
        <Stack gap={2} flexDirection="row">
          <Chip variant="solid" onClick={() => {}}>
            Bestseller
          </Chip>
          <Chip variant="solid" onClick={() => {}} disabled>
            Bestseller
          </Chip>
        </Stack>
        <Stack gap={2} flexDirection="row" sx={{ mt: 2 }}>
          <Chip variant="solid" startDecorator={<Sell />} onClick={() => {}}>
            Bestseller
          </Chip>
          <Chip variant="solid" startDecorator={<Sell />} onClick={() => {}} disabled>
            Bestseller
          </Chip>
        </Stack>
      </>
    );
  },
};

export const Outlined: Story = {
  render: () => {
    return (
      <>
        <Stack gap={2} flexDirection="row">
          <Chip variant="outlined" onClick={() => {}}>
            Bestseller
          </Chip>
          <Chip variant="outlined" onClick={() => {}} disabled>
            Bestseller
          </Chip>
        </Stack>
        <Stack gap={2} flexDirection="row" sx={{ mt: 2 }}>
          <Chip variant="outlined" startDecorator={<Sell />} onClick={() => {}}>
            Bestseller
          </Chip>
          <Chip variant="outlined" startDecorator={<Sell />} onClick={() => {}} disabled>
            Bestseller
          </Chip>
        </Stack>
      </>
    );
  },
};

export const SelectedChip: Story = {
  render: function ChipWithCheckboxStory() {
    const [checked, setChecked] = React.useState(false);
    return (
      <>
        <Stack gap={2} flexDirection="row">
          <Chip
            variant={checked ? 'solid' : 'outlined'}
            startDecorator={<Sell />}
            onClick={() => {
              setChecked(!checked);
            }}
          >
            Bestseller
          </Chip>

          <Chip
            disabled
            variant={checked ? 'solid' : 'outlined'}
            startDecorator={<Sell />}
            onClick={() => {
              setChecked(!checked);
            }}
          >
            Disabled
          </Chip>
        </Stack>
      </>
    );
  },
};
