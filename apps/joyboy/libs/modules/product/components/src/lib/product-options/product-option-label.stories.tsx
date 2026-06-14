import type { Meta, StoryObj } from '@storybook/react';
import { ProductOptionLabel } from './product-option-label';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof ProductOptionLabel> = {
  component: ProductOptionLabel,
  title: 'module/product/product-options/ProductOptionLabel',
};
export default meta;
type Story = StoryObj<typeof ProductOptionLabel>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ProductOptionLabel!/gi)).toBeTruthy();
  },
};
