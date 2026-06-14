import type { Meta, StoryObj } from '@storybook/react';
import { VariantPrice } from './variant-price';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof VariantPrice> = {
  component: VariantPrice,
  title: 'module/product/product-options/VariantPrice',
};
export default meta;
type Story = StoryObj<typeof VariantPrice>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to VariantPrice!/gi)).toBeTruthy();
  },
};
