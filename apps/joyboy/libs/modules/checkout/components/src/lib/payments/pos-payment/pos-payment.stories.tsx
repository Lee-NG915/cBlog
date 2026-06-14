import type { Meta, StoryObj } from '@storybook/react';
import PosPayment from './pos-payment';
import React from 'react';

const meta: Meta<typeof PosPayment> = {
  component: PosPayment,
  title: 'module/checkout/PosPayment',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=2027-16148&mode=dev',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof PosPayment>;

export const Primary: Story = {
  args: {
    payMethodsGetter: () => [
      {
        id: 2,
        name: 'Braintree',
        description: 'Credit Card via Braintree',
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 13,
        name: '2C2P Instalment Payment',
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 15,
        name: 'Hoolah Pay',
        description: 'Hoolah Pay',
        response_code_required: false,
        auto_response_code: true,
        response_code_hint: '',
      },
      {
        id: 16,
        name: 'Stripe Credit Card',
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 18,
        name: 'Hoolah Pay',
        description: 'Hoolah Pay',
        response_code_required: false,
        auto_response_code: true,
        response_code_hint: '',
      },
      {
        id: 20,
        name: 'Grab Pay',
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 21,
        name: 'Stripe Apple Pay',
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 22,
        name: 'Stripe Google Pay',
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
    ],

    paymentAdder: () => {
      alert('show payment drawer');
    },
  },
  render: (args) => {
    return <PosPayment {...args} />;
  },
};
