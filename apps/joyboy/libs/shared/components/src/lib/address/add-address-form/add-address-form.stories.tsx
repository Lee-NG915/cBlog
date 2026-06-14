import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AddAddressForm } from './add-address-form';

const meta: Meta<typeof AddAddressForm> = {
  component: AddAddressForm,
  title: 'module/checkout/AddAddressForm',
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
type Story = StoryObj<typeof AddAddressForm>;

export const Primary: Story = {
  args: {
    cancel: () => {
      alert('cancel');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submit: (data: Record<string, any>) => {
      alert(JSON.stringify(data));
      return Promise.resolve();
    },
  },
  render: (args) => {
    return <AddAddressForm {...args} />;
  },
};
