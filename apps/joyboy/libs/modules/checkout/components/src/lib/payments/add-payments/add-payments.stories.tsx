import type { Meta, StoryObj } from '@storybook/react';
import AddPayments from './add-payments';
import React from 'react';

const meta: Meta<typeof AddPayments> = {
  component: AddPayments,
  title: 'module/checkout/AddPayments',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1844-22274&mode=dev',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof AddPayments>;

export const Primary: Story = {
  args: {
    payMethodsGetter: () => [
      {
        id: 17,
        name: 'Stripe',
        payment_types: ['Stripe'],
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 3,
        name: 'SC Term',
        payment_types: ['SC VISA', 'SC MasterCard', 'SC IPP', 'UnionPay'],
        response_code_required: true,
        auto_response_code: false,
        response_code_hint: 'Appr Code',
      },
      {
        id: 10,
        name: 'OCBC Term',
        payment_types: ['OCBC VISA', 'OCBC MasterCard', 'OCBC IPP', 'VISA', 'MasterCard'],
        response_code_required: true,
        auto_response_code: false,
        response_code_hint: 'Appr Code',
      },
      {
        id: 9,
        name: 'AMEX Term',
        payment_types: ['AMEX', 'AMEX EPP'],
        response_code_required: true,
        auto_response_code: false,
        response_code_hint: 'Appr Code',
      },
      {
        id: 8,
        name: 'NETS',
        payment_types: ['NETS'],
        response_code_required: true,
        auto_response_code: true,
        response_code_hint: '',
      },
      {
        id: 4,
        name: 'Transfer',
        payment_types: ['Bank Transfer'],
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 5,
        name: 'POS Paypal',
        payment_types: ['POS Paypal'],
        response_code_required: true,
        auto_response_code: false,
        response_code_hint: 'PayPal Transaction ID',
      },
      {
        id: 6,
        name: 'Credit Memo',
        payment_types: ['Credit Note'],
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 11,
        name: 'Cash',
        payment_types: ['Cash'],
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 12,
        name: 'Cheque',
        description: 'Cheque',
        payment_types: ['Cheque'],
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 23,
        name: 'POS GrabPay',
        payment_types: ['POS GrabPay'],
        response_code_required: true,
        auto_response_code: false,
        response_code_hint: 'GrabPay Transaction ID',
      },
      {
        id: 26,
        name: 'Stripe Payment Link',
        response_code_required: false,
        auto_response_code: false,
        response_code_hint: '',
      },
      {
        id: 27,
        name: 'DBS Term',
        payment_types: ['DBS IPP'],
        response_code_required: true,
        auto_response_code: false,
        response_code_hint: 'Appr Code',
      },
      {
        id: 28,
        name: 'Shopback',
        payment_types: ['Shopback '],
        response_code_required: true,
        auto_response_code: false,
        response_code_hint: 'Appr Code',
      },
    ],
    addPayMethod: (payload) => {
      alert('confirm to add pay method now:' + JSON.stringify(payload));
    },
  },
  render: (args) => {
    return <AddPayments {...args} />;
  },
};
