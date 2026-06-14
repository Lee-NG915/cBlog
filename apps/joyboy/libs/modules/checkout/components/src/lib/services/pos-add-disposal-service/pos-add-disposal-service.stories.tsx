import type { Meta, StoryObj } from '@storybook/react';
import PosAddDisposalService from './pos-add-disposal-service';
import React from 'react';

const meta: Meta<typeof PosAddDisposalService> = {
  component: PosAddDisposalService,
  title: 'module/checkout/PosAddDisposalService',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1844-22153&mode=dev',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof PosAddDisposalService>;

export const Primary: Story = {
  args: {
    shipmentId: 1,
  },
  render: (args) => {
    return <PosAddDisposalService {...args} />;
  },
};
