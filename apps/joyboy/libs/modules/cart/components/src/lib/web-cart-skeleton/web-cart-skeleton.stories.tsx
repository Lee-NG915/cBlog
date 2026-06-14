import type { Meta, StoryObj } from '@storybook/react';
import { WebCartSkeleton } from './web-cart-skeleton';

const meta: Meta<typeof WebCartSkeleton> = {
  component: WebCartSkeleton,
  title: 'module/cart/WebCartSkeleton',
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
type Story = StoryObj<typeof WebCartSkeleton>;

export const Primary: Story = {
  args: {
    item: {},
  },
  render: (args) => {
    return <WebCartSkeleton {...args} />;
  },
};
