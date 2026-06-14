import type { Meta, StoryObj } from '@storybook/react';
import { WebPaymentBillingAddressSelector } from './web-payment-billing-address-selector';

const meta: Meta<typeof WebPaymentBillingAddressSelector> = {
  component: WebPaymentBillingAddressSelector,
  title: 'Payment/WebPaymentBillingAddressSelector',
  tags: ['autodocs'],
  argTypes: {
    selectedAddressId: {
      control: 'number',
      description: 'Selected billing address ID',
    },
    onAddressSelect: {
      action: 'addressSelected',
      description: 'Callback when address selection changes',
    },
    defaultUseShippingAddress: {
      control: 'boolean',
      description: 'Whether to use shipping address as default',
    },
    onUseShippingAddressChange: {
      action: 'useShippingAddressChanged',
      description: 'Callback when "use shipping address" checkbox changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WebPaymentBillingAddressSelector>;

export const Default: Story = {
  args: {
    defaultUseShippingAddress: true,
  },
};

export const WithShippingAddressUnchecked: Story = {
  args: {
    defaultUseShippingAddress: false,
  },
};

export const WithSelectedAddress: Story = {
  args: {
    defaultUseShippingAddress: false,
    selectedAddressId: 123,
  },
};

