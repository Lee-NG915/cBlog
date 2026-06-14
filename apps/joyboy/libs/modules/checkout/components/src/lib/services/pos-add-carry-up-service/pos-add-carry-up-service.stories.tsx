import type { Meta, StoryObj } from '@storybook/react';
import PosAddCarryUpService from './pos-add-carry-up-service';
import React from 'react';

const meta: Meta<typeof PosAddCarryUpService> = {
  component: PosAddCarryUpService,
  title: 'module/checkout/PosAddCarryUpService',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1844-22189&mode=dev',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof PosAddCarryUpService>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <PosAddCarryUpService {...args} />;
  },
};
