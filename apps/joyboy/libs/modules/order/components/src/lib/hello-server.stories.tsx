/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { HelloServer } from './hello-server';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof HelloServer> = {
  component: HelloServer,
  title: 'module/order/hello-server',
};
export default meta;
type Story = StoryObj<typeof HelloServer>;

// export const PrimaryOrder = {
//   args: {},
// };

// export const HeadingOrder: Story = {
//   args: {},
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     expect(canvas.getByText(/Welcome to HelloServer!/gi)).toBeTruthy();
//   },
// };
