// Link.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import { Link, LinkProps } from './Link';

const meta: Meta<LinkProps> = {
  title: 'fortress/Link',
  component: Link,
};

export default meta;
type Story = StoryObj<LinkProps>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: () => <Link>link</Link>,
};
