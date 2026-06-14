import type { Meta, StoryObj } from '@storybook/react';
import PosOrderComplete from './pos-order-complete';
import React from 'react';
import { Box } from '@castlery/fortress';

const meta: Meta<typeof PosOrderComplete> = {
  component: PosOrderComplete,
  title: 'module/checkout/PosOrderComplete',
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
type Story = StoryObj<typeof PosOrderComplete>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return (
      <Box sx={{ width: '100%', height: '100vh' }}>
        <PosOrderComplete {...args} />
      </Box>
    );
  },
};
