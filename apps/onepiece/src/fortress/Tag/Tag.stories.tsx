// Tag.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Tag, TagProps } from './index';
import React, { useState } from 'react';
import { Card, Stack } from 'fortress';
import { Sell } from 'fortress/Icons';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/Tag',
  component: Tag,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=74%3A275&mode=dev',
    },
  },
} as Meta<TagProps>;
export default meta;

type Story = StoryObj<TagProps>;

export const variants = () => {
  return (
    <Stack>
      <Tag variant="plain">Sale</Tag>
      <Tag variant="outlined" startDecorator={<Sell />} endDecorator={<Sell />}>
        Campaign Discount Name
      </Tag>
      <Tag variant="solid" startDecorator={<Sell />} endDecorator={<Sell />}>
        Campaign Discount Name
      </Tag>
    </Stack>
  );
};

export const longContent = () => {
  return (
    <Stack gap={2}>
      <Tag variant="outlined" startDecorator={<Sell />}>
        Campaign Discount Name
      </Tag>
      <Card variant="outlined" sx={{ width: 200, height: 300, display: 'flex', gap: 2 }}>
        <Tag variant="outlined" startDecorator={<Sell />}>
          Campaign Discount Name
        </Tag>
      </Card>
    </Stack>
  );
};
