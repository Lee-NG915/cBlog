import type { Meta, StoryObj } from '@storybook/react';
import { WebQtyActions } from './web-qty-actions';

const meta: Meta<typeof WebQtyActions> = {
  component: WebQtyActions,
  title: 'module/cart/WebQtyActions',
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
type Story = StoryObj<typeof WebQtyActions>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <WebQtyActions />;
  },
};
