import type { Meta, StoryObj } from '@storybook/react';
import { VariantQuantity } from './variant-quantity';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof VariantQuantity> = {
  component: VariantQuantity,
  title: 'module/product/product-options/VariantQuantity',
};
export default meta;
type Story = StoryObj<typeof VariantQuantity>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to VariantQuantity!/gi)).toBeTruthy();
  },
};
