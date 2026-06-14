/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { OrderSummaryV2 } from './pos-order-summaryV2';
import { CouponWalletV2 } from '../coupon-wallet/coupon-wallet/coupon-walletV2';

const meta: Meta<typeof OrderSummaryV2> = {
  component: OrderSummaryV2,
  title: 'module/order/PosOrderSummary',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?node-id=1844%3A21017&mode=dev',
    },
  },
};
export default meta;
type Story = StoryObj<typeof OrderSummaryV2>;

export const Primary: Story = {
  args: {
    CouponWallet: <CouponWalletV2 />,
  },

  render: (args) => {
    return <OrderSummaryV2 {...args} />;
  },
};
