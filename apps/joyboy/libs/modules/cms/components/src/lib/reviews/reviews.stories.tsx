'use client';
import type { Meta, StoryObj } from '@storybook/react';
import { Reviews, ReviewsProps } from './reviews';
import { Stack } from '@castlery/fortress';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/cms/Reviews',
  component: Reviews,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/rCAKNNDsMcov8XW9rtCbsP/%5BASH%5D-PLA-Revamp?node-id=723-2568&m=dev',
    },
  },
} as Meta<ReviewsProps>;
export default meta;

type Story = StoryObj<ReviewsProps>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return (
      <Stack>
        <Reviews {...args} />
      </Stack>
    );
  },
};
