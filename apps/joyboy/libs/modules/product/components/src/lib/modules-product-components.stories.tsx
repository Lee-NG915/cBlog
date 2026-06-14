import type { Meta, StoryObj } from '@storybook/react';
import { ModulesProductComponents } from './modules-product-components';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof ModulesProductComponents> = {
  component: ModulesProductComponents,
  title: 'ModulesProductComponents',
};
export default meta;
type Story = StoryObj<typeof ModulesProductComponents>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ModulesProductComponents!/gi)).toBeTruthy();
  },
};
