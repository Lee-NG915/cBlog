import type { Meta, StoryObj } from '@storybook/react';
import { StockLocationSelector } from './stock-select';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof StockLocationSelector> = {
  component: StockLocationSelector,
  title: 'module/product/StockSelect',
  argTypes: {
    onStockSelectChange: { action: 'onStockSelectChange executed!' },
  },
};
export default meta;
type Story = StoryObj<typeof StockLocationSelector>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to StockSelect!/gi)).toBeTruthy();
  },
};
