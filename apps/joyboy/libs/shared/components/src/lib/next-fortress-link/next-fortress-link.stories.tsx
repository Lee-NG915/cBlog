import type { Meta, StoryObj } from '@storybook/react';
import { NextFortressLink } from './next-fortress-link';
import { Stack } from '@castlery/fortress';
import { Add } from '@castlery/fortress/Icons/index';

const meta: Meta<typeof NextFortressLink> = {
  title: 'fortress/NextFortressLink',
  component: NextFortressLink,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=1563-4308&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof NextFortressLink>;

export const Primary: Story = {
  render: () => (
    <Stack spacing={4} direction={'row'}>
      <NextFortressLink href="https://example.com">link</NextFortressLink>
      <NextFortressLink href="https://example.com" disabled>
        link
      </NextFortressLink>
      <NextFortressLink href="https://example.com" startDecorator={<Add />}>
        link
      </NextFortressLink>
      <NextFortressLink href="https://example.com" endDecorator={<Add />}>
        link
      </NextFortressLink>
      <NextFortressLink href="https://example.com" startDecorator={<Add />} endDecorator={<Add />}>
        link
      </NextFortressLink>
    </Stack>
  ),
};
