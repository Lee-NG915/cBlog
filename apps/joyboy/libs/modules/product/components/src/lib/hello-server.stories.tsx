import type { Meta, StoryObj } from '@storybook/react';
import { HelloServer } from './hello-server';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof HelloServer> = {
  component: HelloServer,
  title: 'module/product/HelloServer',
};
export default meta;
type Story = StoryObj<typeof HelloServer>;

export const PrimaryProduct = {
  args: {},
};

export const HeadingProduct: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to HelloServer!/gi)).toBeTruthy();
  },
};
