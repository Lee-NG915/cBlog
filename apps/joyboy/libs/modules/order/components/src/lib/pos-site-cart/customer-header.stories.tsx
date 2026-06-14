import type { Meta, StoryObj } from '@storybook/react';
import CustomerHeader from './customer-header';
//CustomerHeader

const meta: Meta<typeof CustomerHeader> = {
  component: CustomerHeader,
  title: 'module/order/CartCustomerHeader',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1844-22633&mode=dev',
    },
  },
};
export default meta;
type Story = StoryObj<typeof CustomerHeader>;

export const CartCustomerHeader: Story = {
  args: {
    name: 'Abby Wang',
    email: 'abby@example.com',
    hasOnlineOrder: true,
    toOnlineCart: () => {
      alert('show online cart drawer');
    },
    toSelectCustomer: () => {
      alert('show select customer drawer');
    },
  },
  render: ({ ...args }) => {
    return <CustomerHeader {...args} />;
  },
};
