import type { Meta, StoryObj } from '@storybook/react';
import { PosDeleteItemAction } from './pos-delete-item-action';

const meta: Meta<typeof PosDeleteItemAction> = {
  component: PosDeleteItemAction,
  title: 'module/order/DeleteItemAction',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosDeleteItemAction>;

export const Primary: Story = {
  args: {
    lineItemId: '111111',
  },
  render: ({ ...args }) => {
    return <PosDeleteItemAction {...args} />;
  },
};

export const DeleteWithLoading: Story = {
  args: {
    lineItemId: '111111',
  },
  render: ({ ...args }) => {
    return <PosDeleteItemAction {...args} />;
  },
};
