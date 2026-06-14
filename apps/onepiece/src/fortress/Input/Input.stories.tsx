import type { Meta, StoryObj } from '@storybook/react';
import { Input, InputProps } from './index';
import InputSubscription from './InputSubscription';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / Input',
  component: Input,
} as Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {},
  parameters: {},
};

export { InputSubscription };
