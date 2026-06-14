import type { Meta, StoryObj } from '@storybook/react';
import { ProductModelOptions } from './product-model-options';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof ProductModelOptions> = {
  component: ProductModelOptions,
  title: 'module/product/product-options/ProductModelOptions',
};
export default meta;
type Story = StoryObj<typeof ProductModelOptions>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ProductModelOptions!/gi)).toBeTruthy();
  },
};
