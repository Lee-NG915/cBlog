/* eslint-disable @typescript-eslint/no-unused-vars */
// Tag.stories.ts|tsx
// import { within, expect } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider, SliderProps } from './Slider';
import { Box, Stack } from '..';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    // version: 'v2',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=74%3A275&mode=dev',
    },
  },

  argTypes: {
    defaultValue: {
      control: { type: 'number' },
      description: '默认值',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    max: {
      control: { type: 'number' },
      description: '最大值',
      defaultValue: 100,
    },
    min: {
      control: { type: 'number' },
      description: '最小值',
      defaultValue: 0,
    },
    valueLabelDisplay: {
      options: ['auto', 'on', 'off'],
      control: { type: 'radio' },
      description: '值标签显示方式',
    },
  },
} satisfies Meta<SliderProps>;

export default meta;

type Story = StoryObj<SliderProps>;

// 默认导出的 Story，可通过 Controls 面板调整属性
export const Default: Story = {
  args: {
    defaultValue: 50,
    valueLabelDisplay: 'auto',
    disabled: false,
  },
};

// 展示不同变体的 Story
export const variants: Story = {
  render: () => {
    return (
      <Stack rowGap={1}>
        <Slider defaultValue={[50, 100]} valueLabelDisplay="auto" />
        <Slider defaultValue={100} valueLabelDisplay="auto" />
        <Slider defaultValue={[50, 100]} disabled />
      </Stack>
    );
  },
};

const marks = [
  {
    value: 0,
    label: '0',
  },
  {
    value: 20,
    label: '20',
  },
  {
    value: 37,
    label: '37',
  },
  {
    value: 100,
    label: '100',
  },
];

export function TrackInvertedSlider() {
  return (
    <Box sx={{ width: 250 }}>
      <Slider defaultValue={30} marks={marks} />
      <Slider defaultValue={[20, 37]} marks={marks} />
      <Slider defaultValue={[20, 37]} marks={marks} disabled />
    </Box>
  );
}
