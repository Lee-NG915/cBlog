import type { Meta, StoryObj } from '@storybook/react';
import { ConfigurableProduct } from './configurable-product';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof ConfigurableProduct> = {
  component: ConfigurableProduct,
  title: 'module/product/product-options/ConfigurableProduct',
};
export default meta;
type Story = StoryObj<typeof ConfigurableProduct>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ConfigurableProduct!/gi)).toBeTruthy();
  },
};
