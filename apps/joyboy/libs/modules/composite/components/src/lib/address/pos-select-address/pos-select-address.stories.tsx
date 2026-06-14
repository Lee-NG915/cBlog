import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PosSelectAddress } from './pos-select-address';

const meta: Meta<typeof PosSelectAddress> = {
  component: PosSelectAddress,
  title: 'module/checkout/PosSelectAddress',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof PosSelectAddress>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <PosSelectAddress {...args} />;
  },
};
