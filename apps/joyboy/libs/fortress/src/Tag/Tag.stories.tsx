// Tag.stories.ts|tsx
// import { within, expect } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './index';
import { Stack } from '..';
import { Sell, OOS, Info } from '../Icons';
import { withBrandColor } from '../hooks';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Tag',
  component: Tag,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=74%3A275&mode=dev',
    },
  },

  argTypes: {
    variant: {
      options: ['outlined', 'solid'],
      control: { type: 'radio' },
      description: '标签样式变体',
    },
    color: {
      options: ['primary', 'danger'],
      control: { type: 'radio' },
      description: '标签颜色',
    },
    startDecorator: {
      description: '标签前置装饰元素',
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
  },
};

export const Variants: Story = {
  render: () => {
    return (
      <Stack gap={1}>
        <Tag sx={{ width: '125px' }} variant="outlined">
          showroom pick
        </Tag>
        <Tag variant="outlined" startDecorator={<Sell />}>
          BEST SELLER
        </Tag>
        <Tag variant="solid">BEST SELLER</Tag>
        <Tag variant="solid" startDecorator={<Sell />}>
          BEST SELLER
        </Tag>
        <Tag variant="solid" color="danger" startDecorator={<OOS />}>
          OUT OF STOCK
        </Tag>
        <Tag sx={{ width: '125px' }} variant="outlined" color="danger" startDecorator={<OOS />}>
          OUT OF STOCK
        </Tag>
        <Tag
          variant="solid"
          color="warning"
          startDecorator={<Info sx={{ '--fortress-icon-width': '20px', '--fortress-icon-height': '20px' }} />}
        >
          LOW IN STOCK
        </Tag>
        <Tag
          variant="outlined"
          color="warning"
          startDecorator={<Info sx={{ '--fortress-icon-width': '20px', '--fortress-icon-height': '20px' }} />}
        >
          LOW IN STOCK
        </Tag>
      </Stack>
    );
  },
};

export const WithBrandColor: Story = {
  render: () => {
    return (
      <Stack gap={1}>
        <Tag sx={{ ...withBrandColor('warmLinen', { variant: 'solid' }) }} variant="solid">
          WarmLinen Solid Tag
        </Tag>
        <Tag sx={{ ...withBrandColor('burntOrange', { variant: 'solid' }) }} variant="solid">
          BurntOrange Solid Tag
        </Tag>
        <Tag sx={{ ...withBrandColor('freshWaterBlue', { variant: 'solid' }) }} variant="solid">
          FreshWaterBlue Solid Tag
        </Tag>

        <Tag sx={{ ...withBrandColor('warmLinen', { variant: 'outlined' }) }} variant="outlined">
          WarmLinen Outlined Tag
        </Tag>
        <Tag sx={{ ...withBrandColor('burntOrange', { variant: 'outlined' }) }} variant="outlined">
          BurntOrange Outlined Tag
        </Tag>
        <Tag sx={{ ...withBrandColor('freshWaterBlue', { variant: 'outlined' }) }} variant="outlined">
          FreshWaterBlue Outlined Tag
        </Tag>
      </Stack>
    );
  },
};
