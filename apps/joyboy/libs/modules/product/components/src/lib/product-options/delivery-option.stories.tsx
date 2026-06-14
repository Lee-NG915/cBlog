import type { Meta, StoryObj } from '@storybook/react';
import { DeliveryOption } from './delivery-option';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof DeliveryOption> = {
  component: DeliveryOption,
  title: 'module/product/product-options/DeliveryOption',
};
export default meta;
type Story = StoryObj<typeof DeliveryOption>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to DeliveryOption!/gi)).toBeTruthy();
  },
};
