import type { Meta, StoryObj } from '@storybook/react';
import { ATCButton } from './atc-button';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof ATCButton> = {
  component: ATCButton,
  title: 'module/product/product-options/ATCButton',
};
export default meta;
type Story = StoryObj<typeof ATCButton>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ATCButton!/gi)).toBeTruthy();
  },
};
export const Loading: Story = {
  args: {
    loading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ATCButton!/gi)).toBeTruthy();
  },
};
export const disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ATCButton!/gi)).toBeTruthy();
  },
};
