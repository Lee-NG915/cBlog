import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PosAddAddress } from './pos-add-address-adapter';

const meta: Meta<typeof PosAddAddress> = {
  component: PosAddAddress,
  title: 'module/checkout/PosAddAddress',
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
type Story = StoryObj<typeof PosAddAddress>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <PosAddAddress {...args} />;
  },
};
