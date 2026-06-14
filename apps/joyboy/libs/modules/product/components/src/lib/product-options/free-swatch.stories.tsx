import type { Meta, StoryObj } from '@storybook/react';
import { FreeSwatch } from './free-swatch';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof FreeSwatch> = {
  component: FreeSwatch,
  title: 'module/product/product-options/FreeSwatch',
};
export default meta;
type Story = StoryObj<typeof FreeSwatch>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to FreeSwatch!/gi)).toBeTruthy();
  },
};
