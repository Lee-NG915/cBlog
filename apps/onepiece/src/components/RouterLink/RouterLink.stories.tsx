// RouterLink.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import { RouterLink } from './RouterLink';

const meta: Meta<typeof RouterLink> = {
  component: RouterLink,
};

export default meta;
type Story = StoryObj<typeof RouterLink>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  parameters: {},
  render: () => <RouterLink to="">Learn more</RouterLink>,
};
