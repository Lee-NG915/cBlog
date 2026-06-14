import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from './number-input';
import * as React from 'react';
import { userEvent, within, expect } from '@storybook/test';

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
  title: 'Components/Numberinput',
};
export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Primary: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByTestId('input');
    expect(input).toBeVisible();
    expect(input).toBeInTheDocument();
    await userEvent.type(input, '{arrowUp}');
    await userEvent.type(input, '{arrowDown}');
  },
  render: () => {
    return <NumberInput min={0} step={1} shiftMultiplier={5} data-testid="input" />;
  },
};
