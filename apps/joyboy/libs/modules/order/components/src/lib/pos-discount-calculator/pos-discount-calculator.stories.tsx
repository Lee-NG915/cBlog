import type { Meta, StoryObj } from '@storybook/react';
import PosDiscountCalculator from './pos-discount-calculator';

const meta: Meta<typeof PosDiscountCalculator> = {
  component: PosDiscountCalculator,
  title: 'module/order/PosDiscount/Calculator',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=2011-11274&mode=dev',
      // https://github.com/vercel/next.js/discussions/50068
      // nextjs: {
      //   appDirectory: true,
      // },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosDiscountCalculator>;

export const Calculator: Story = {
  args: {},
  render: ({ ...args }) => {
    return <PosDiscountCalculator {...args} />;
  },
};
