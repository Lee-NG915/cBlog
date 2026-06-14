import type { Meta, StoryObj } from '@storybook/react';
import { WebCartItemList } from './web-cart-item-list';

const meta: Meta<typeof WebCartItemList> = {
  component: WebCartItemList,
  title: 'module/cart/CartItemList',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof WebCartItemList>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <WebCartItemList />;
  },
};
