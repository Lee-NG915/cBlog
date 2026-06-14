import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarProps } from './index';
import { Box } from '@mui/joy';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / Avatar',
  component: Avatar,
} as Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Primary: Story = {
  args: {},
  parameters: {},
};

export function InitialAvatars() {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Avatar variant="solid" color="primary">
        RE
      </Avatar>
      <Avatar variant="soft" />
      <Avatar variant="outlined" />
      <Avatar variant="plain" />
    </Box>
  );
}
export function AvatarVariants() {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Avatar variant="solid" color="primary" />
      <Avatar variant="soft" />
      <Avatar variant="outlined" />
      <Avatar variant="plain" />
    </Box>
  );
}
export function AvatarSizes() {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Avatar size="sm" />
      <Avatar size="md" />
      <Avatar size="lg" />
    </Box>
  );
}
