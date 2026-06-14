import type { Meta, StoryObj } from '@storybook/react';
import { SelectAddress } from './select-address';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof SelectAddress> = {
  component: SelectAddress,
  title: 'module/user/address/SelectAddress',
};
export default meta;
type Story = StoryObj<typeof SelectAddress>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to SelectAddress!/gi)).toBeTruthy();
  },
};
