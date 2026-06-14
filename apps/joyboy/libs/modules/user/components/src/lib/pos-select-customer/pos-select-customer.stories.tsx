import type { Meta, StoryObj } from '@storybook/react';
import { PosSelectCustomer } from './pos-select-customer';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof PosSelectCustomer> = {
  component: PosSelectCustomer,
  title: 'module/user/PosSelectCustomer',
};
export default meta;
type Story = StoryObj<typeof PosSelectCustomer>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText(/Welcome to PosSelectCustomer!/gi)).toBeTruthy();
  },
};
