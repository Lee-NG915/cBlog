import type { Meta, StoryObj } from '@storybook/react';
import { WebCartItem } from './web-cart-item';

const meta: Meta<typeof WebCartItem> = {
  component: WebCartItem,
  title: 'module/cart/WebCartItem',
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
type Story = StoryObj<typeof WebCartItem>;

export const Primary: Story = {
  args: {
    item: {},
  },
  render: (args) => {
    return <WebCartItem {...args} />;
  },
};
