import type { Meta, StoryObj } from '@storybook/react';
import { PosSiteHeader } from './pos-site-header';

import { userEvent, within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof PosSiteHeader> = {
  component: PosSiteHeader,
  title: 'module/user/PosSiteHeader',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1009-1401&mode=dev',
    },
  },
};
export default meta;
type Story = StoryObj<typeof PosSiteHeader>;

export const Primary = {
  args: {
    text: '',
    padding: 0,
    disabled: false,
  },
};

export const Heading: Story = {
  args: {
    text: '',
    padding: 0,
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to PosSiteHeader!/gi)).toBeTruthy();
  },
};
export const Drawer: Story = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1009-1584&mode=dev',
    },
  },
  args: {
    text: '',
    padding: 0,
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
  },
};
