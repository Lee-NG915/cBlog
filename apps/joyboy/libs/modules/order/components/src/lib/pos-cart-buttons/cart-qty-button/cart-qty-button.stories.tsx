import type { Meta, StoryObj } from '@storybook/react';
import { CartQtyButton, QtyType } from './cart-qty-button';
import { useAsyncFn } from 'react-use';

const meta: Meta<typeof CartQtyButton> = {
  component: CartQtyButton,
  title: 'module/order/CartQtyButton',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};
export default meta;
type Story = StoryObj<typeof CartQtyButton>;

export const ADD: Story = {
  args: {
    type: QtyType.ADD,
    loading: false,
    disabled: false,
    handler: () => {
      alert('change quantity : ' + QtyType.ADD);
    },
  },
  render: ({ ...args }) => {
    return <CartQtyButton {...args} />;
  },
};

export const REDUCE: Story = {
  args: {
    type: QtyType.REDUCE,
    loading: false,
    disabled: false,
    handler: () => {
      alert('change quantity : ' + QtyType.REDUCE);
    },
  },
  render: ({ ...args }) => {
    return <CartQtyButton {...args} />;
  },
};

export const ASYNC_BUTTON: Story = {
  args: {
    type: QtyType.ADD,
    disabled: false,
  },
  render: ({ ...args }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, fn] = useAsyncFn(async () => {
      console.log('change quantity');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }, []);
    return <CartQtyButton {...args} loading={state.loading} handler={fn} />;
  },
};
