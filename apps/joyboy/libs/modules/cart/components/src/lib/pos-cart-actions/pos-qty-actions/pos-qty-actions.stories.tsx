import type { Meta, StoryObj } from '@storybook/react';
import { PosQtyActions } from './pos-qty-actions';

const meta: Meta<typeof PosQtyActions> = {
  component: PosQtyActions,
  title: 'module/cart/PosQtyActions',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosQtyActions>;

export const Primary: Story = {
  args: {
    item: {
      id: '1',
      quantity: 1,
      variant: {
        id: 123456,
        maxSaleQty: 10,
        minSaleQty: 1,
        qtyIncrements: 1,
      },
    },
  },
  render: ({ ...args }) => {
    return <PosQtyActions item={args.item} />;
  },
};
