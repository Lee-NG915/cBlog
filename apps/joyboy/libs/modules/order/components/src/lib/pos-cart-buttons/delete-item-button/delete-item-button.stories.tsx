import type { Meta, StoryObj } from '@storybook/react';
import { DeleteItemButton } from './delete-item-button';

const meta: Meta<typeof DeleteItemButton> = {
  component: DeleteItemButton,
  title: 'module/order/DeleteItemButton',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
};
export default meta;
type Story = StoryObj<typeof DeleteItemButton>;

export const Primary: Story = {
  args: {
    handler: async () => {
      alert('delete item');
    },
  },
  render: ({ ...args }) => {
    return <DeleteItemButton {...args} />;
  },
};

export const DeleteWithLoading: Story = {
  args: {
    handler: async () => {
      console.log('delete item');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
  render: ({ ...args }) => {
    return <DeleteItemButton {...args} />;
  },
};
