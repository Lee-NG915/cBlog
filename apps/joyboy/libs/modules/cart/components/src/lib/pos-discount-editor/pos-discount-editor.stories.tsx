import type { Meta, StoryObj } from '@storybook/react';
import { PosDiscountEditor } from './pos-discount-editor';

const meta: Meta<typeof PosDiscountEditor> = {
  component: PosDiscountEditor,
  title: 'module/cart/PosDiscount/Editor',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosDiscountEditor>;

export const PrimaryEditor: Story = {
  args: {
    amount: '1999',
    discount: '',
    discountFn: async (type, discount) => {
      console.log(type, discount);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
  },
  render: ({ ...args }) => {
    return <PosDiscountEditor {...args} />;
  },
};

export const DefaultDiscount: Story = {
  args: {
    amount: '1999',
    discount: '99',
    discountFn: async (type, discount) => {
      console.log(type, discount);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
  },
  render: ({ ...args }) => {
    return <PosDiscountEditor {...args} />;
  },
};
