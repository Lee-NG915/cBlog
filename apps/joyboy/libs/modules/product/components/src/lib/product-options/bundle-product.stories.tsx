import type { Meta, StoryObj } from '@storybook/react';
import { BundleProduct } from './bundle-product';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof BundleProduct> = {
  component: BundleProduct,
  title: 'module/product/product-options/BundleProduct',
};
export default meta;
type Story = StoryObj<typeof BundleProduct>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to BundleProduct!/gi)).toBeTruthy();
  },
};
