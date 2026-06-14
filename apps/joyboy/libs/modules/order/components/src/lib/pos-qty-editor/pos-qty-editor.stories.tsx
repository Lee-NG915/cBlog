import type { Meta, StoryObj } from '@storybook/react';
import { QtyType } from '../pos-cart-buttons/cart-qty-button/cart-qty-button';
import { PosQtyEditor } from './pos-qty-editor';
import { useState } from 'react';

const meta: Meta<typeof PosQtyEditor> = {
  component: PosQtyEditor,
  title: 'module/order/PosQtyEditor',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosQtyEditor>;

export const Primary: Story = {
  args: {},
  render: ({ ...args }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [quantity, setQuantity] = useState<number>(1);
    const changeQty = (type: QtyType): Promise<void> =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          setQuantity(type === QtyType.ADD ? quantity + 1 : quantity - 1);
          resolve();
        }, 1000)
      );
    return <PosQtyEditor quantity={quantity} changeQty={changeQty} />;
  },
};
