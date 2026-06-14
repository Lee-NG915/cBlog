import type { Meta, StoryObj } from '@storybook/react';
import { PosMenu } from './pos-menu';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof PosMenu> = {
  component: PosMenu,
  title: 'module/user/PosMenu',
};
export default meta;
type Story = StoryObj<typeof PosMenu>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to PosMenu!/gi)).toBeTruthy();
  },
};
