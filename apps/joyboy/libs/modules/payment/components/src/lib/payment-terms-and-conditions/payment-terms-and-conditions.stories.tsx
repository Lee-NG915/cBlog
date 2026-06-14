import type { Meta, StoryObj } from '@storybook/react';
import { PaymentTermsAndConditions } from './payment-terms-and-conditions';

const meta: Meta<typeof PaymentTermsAndConditions> = {
  component: PaymentTermsAndConditions,
  title: 'Payment/PaymentTermsAndConditions',
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when checkbox state changes',
    },
    refundPolicyUrl: {
      control: 'text',
      description: 'URL for refund policy page',
    },
    deliveryPolicyUrl: {
      control: 'text',
      description: 'URL for delivery policy page',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PaymentTermsAndConditions>;

export const Default: Story = {
  args: {
    checked: false,
    refundPolicyUrl: '/refund-policy',
    deliveryPolicyUrl: '/delivery-policy',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    refundPolicyUrl: '/refund-policy',
    deliveryPolicyUrl: '/delivery-policy',
  },
};

export const CustomUrls: Story = {
  args: {
    checked: false,
    refundPolicyUrl: 'https://castlery.com/sg/refund-policy',
    deliveryPolicyUrl: 'https://castlery.com/sg/delivery-policy',
  },
};

export const WithCustomText: Story = {
  args: {
    checked: false,
    termsText: (
      <>
        I agree to the <a href="/terms">terms and conditions</a> and{' '}
        <a href="/privacy">privacy policy</a>.
      </>
    ),
  },
};

