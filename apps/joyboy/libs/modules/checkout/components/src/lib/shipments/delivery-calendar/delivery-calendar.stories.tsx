import type { Meta, StoryObj } from '@storybook/react';
import { DeliveryCalendar } from './delivery-calendar';
import React from 'react';

const meta: Meta<typeof DeliveryCalendar> = {
  component: DeliveryCalendar,
  title: 'module/checkout/DeliveryCalendar',
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
type Story = StoryObj<typeof DeliveryCalendar>;

export const Primary: Story = {
  args: {
    defaultChecked: true,
    labelElement: 'Free Assembly',
    helperTextElement:
      'Complimentary assembling service will be provided to all item(s) in your order that require assembling except Castlery’s Accessories.',
  },
  render: (args) => {
    return <DeliveryCalendar {...args} />;
  },
};
