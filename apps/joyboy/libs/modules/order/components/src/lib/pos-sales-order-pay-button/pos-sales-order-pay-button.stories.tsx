import type { Meta, StoryObj } from '@storybook/react';
import { PosSalesOrderList } from './pos-sales-order-list';

const meta: Meta<typeof PosSalesOrderList> = {
  component: PosSalesOrderList,
  title: 'module/order/PosSalesOrderList',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1844-22633&mode=dev',
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosSalesOrderList>;

export const Default: Story = {
  render: () => <PosSalesOrderList />,
};
