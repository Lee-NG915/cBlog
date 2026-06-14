import type { Meta, StoryObj } from '@storybook/react';
import { WebRemoveAction } from './web-remove-action';

const meta: Meta<typeof WebRemoveAction> = {
  component: WebRemoveAction,
  title: 'module/cart/WebRemoveAction',
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
type Story = StoryObj<typeof WebRemoveAction>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <WebRemoveAction />;
  },
};
