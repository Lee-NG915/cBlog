import type { Meta, StoryObj } from '@storybook/react';
import { BundleOptions } from './bundle-options';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof BundleOptions> = {
  component: BundleOptions,
  title: 'module/product/product-options/BundleOptions',
};
export default meta;
type Story = StoryObj<typeof BundleOptions>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to BundleOptions!/gi)).toBeTruthy();
  },
};
