import type { Meta, StoryObj } from '@storybook/react';
import { CartQtyActions, QtyActionType } from './cart-qty-actions';
import { useAsyncFn } from 'react-use';

const meta: Meta<typeof CartQtyActions> = {
  component: CartQtyActions,
  title: 'module/order/CartQtyActions',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};
export default meta;
type Story = StoryObj<typeof CartQtyActions>;

export const ADD: Story = {
  args: {
    type: QtyActionType.ADD,
    loading: false,
    disabled: false,
    handler: () => {
      alert('change quantity : ' + QtyActionType.ADD);
    },
  },
  render: ({ ...args }) => {
    return <CartQtyActions {...args} />;
  },
};

export const REDUCE: Story = {
  args: {
    type: QtyActionType.REDUCE,
    loading: false,
    disabled: false,
    handler: () => {
      alert('change quantity : ' + QtyActionType.REDUCE);
    },
  },
  render: ({ ...args }) => {
    return <CartQtyActions {...args} />;
  },
};

export const ASYNC_BUTTON: Story = {
  args: {
    type: QtyActionType.ADD,
    disabled: false,
  },
  render: ({ ...args }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, fn] = useAsyncFn(async () => {
      console.log('change quantity');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }, []);
    return <CartQtyActions {...args} loading={state.loading} handler={fn} />;
  },
};
