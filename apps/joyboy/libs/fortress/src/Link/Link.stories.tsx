// Link.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Link, LinkProps } from './Link';
import { withBrandColor } from '../hooks/useBrandColor';
import { Stack } from '..';
import { Add } from '../Icons';
import { ComponentType } from 'react';
const meta: Meta<LinkProps> = {
  title: 'Components/Link',
  component: Link as ComponentType<LinkProps>,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=1563-4308&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<LinkProps>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Variants: Story = {
  render: () => (
    <Stack>
      <Link href="https://example.com" variant="primary" startDecorator={<Add />}>
        primary link
      </Link>
      <Link href="https://example.com" variant="secondary" startDecorator={<Add />}>
        secondary link
      </Link>
      <Link href="https://example.com" variant="tertiary" startDecorator={<Add />}>
        tertiary link
      </Link>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Link href="https://example.com" variant="primary" size="xs">
        xs
      </Link>
      <Link href="https://example.com" variant="primary" size="sm">
        sm
      </Link>
      <Link href="https://example.com" variant="primary" size="md">
        md
      </Link>
      <Link href="https://example.com" variant="primary" size="lg">
        lg
      </Link>
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Link href="https://example.com" variant="primary" startDecorator={<Add />} disabled>
      disabled link
    </Link>
  ),
};

export const BrandColor: Story = {
  render: () => (
    <Link sx={{ ...withBrandColor('rosewood', { variant: 'plain' }) }} variant="plain">
      link
    </Link>
  ),
};

export const webNativeLinkStyle: Story = {
  render: () => (
    <Stack>
      <a href="https://example.com">a link</a>
      <a href="https://example.com" aria-disabled>
        a link
      </a>
    </Stack>
  ),
};
