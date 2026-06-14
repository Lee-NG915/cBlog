/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { PosCart } from './pos-cart';

const meta: Meta<typeof PosCart> = {
  component: PosCart,
  title: 'module/order/PosCart',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=2019-12192&mode=dev',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof PosCart>;

export const Primary: Story = {
  render: () => {
    return <PosCart />;
  },
};
