import type { Meta, StoryObj } from '@storybook/react';
import CartAddService from './pos-add-service';
import { ServiceListItem } from './service-item';

const meta: Meta<typeof CartAddService> = {
  component: CartAddService,
  title: 'module/order/PosAddService',
  parameters: {
    design: {
      type: 'figma',
      // https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=2638-7183&mode=dev
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1844-20341&mode=dev',
      // https://github.com/vercel/next.js/discussions/50068
      // nextjs: {
      //   appDirectory: true,
      // },
    },
  },
};
export default meta;
type Story = StoryObj<typeof CartAddService>;

export const ServiceItem: Story = {
  args: {
    item: {
      id: 19105,
      sku: 'Special Customization',
      name: 'Special Customization',
      description: 'Special Customization',
      price: '9999.0',
    },
    checked: false,
    onChange: (checked) => {
      alert('checked: ' + checked);
    },
  },
  render: ({ ...args }) => {
    return <ServiceListItem {...args} />;
  },
};

export const Primary: Story = {
  args: {
    servicesGetter: () => [
      {
        id: 19105,
        sku: 'Special Customization',
        name: 'Special Customization',
        description: 'Special Customization',
        price: '9999.0',
      },
      {
        id: 19130,
        sku: 'Repackaging Fee',
        name: 'Repacking Fee',
        description: 'Repacking Fee',
        price: '9999.0',
      },
      {
        id: 18969,
        sku: 'Delivery Charge',
        name: 'Delivery Charge',
        description: 'Delivery Charge',
        price: '9999.0',
      },
      {
        id: 18946,
        sku: 'Room of Choice',
        name: 'Room of Choice',
        description: 'Room of Choice',
        price: '50.0',
      },
      {
        id: 18947,
        sku: 'White Glove',
        name: 'White Glove',
        description: 'White Glove',
        price: '100.0',
      },
    ],
    cancel: () => {
      alert('close');
    },
    confirm: (payload) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          alert('confirm: ' + JSON.stringify(payload));
          resolve();
        }, 1000);
      });
    },
  },
  render: ({ ...args }) => {
    return <CartAddService {...args} />;
  },
};
