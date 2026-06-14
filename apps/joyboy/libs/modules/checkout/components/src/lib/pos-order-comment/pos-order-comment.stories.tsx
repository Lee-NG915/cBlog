import type { Meta, StoryObj } from '@storybook/react';
import PosOrderComment from './pos-order-comment';
import React from 'react';

const meta: Meta<typeof PosOrderComment> = {
  component: PosOrderComment,
  title: 'module/checkout/PosOrderComment',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=2027-16148&mode=dev',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof PosOrderComment>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <PosOrderComment {...args} />;
  },
};
