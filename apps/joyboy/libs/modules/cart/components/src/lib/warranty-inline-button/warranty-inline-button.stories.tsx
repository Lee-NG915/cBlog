import type { Meta, StoryObj } from '@storybook/react';
import { WarrantyInlineButton } from './warranty-inline-button';

const meta: Meta<typeof WarrantyInlineButton> = {
  component: WarrantyInlineButton,
  title: 'module/cart/WarrantyInlineButton',
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
type Story = StoryObj<typeof WarrantyInlineButton>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <WarrantyInlineButton />;
  },
};
