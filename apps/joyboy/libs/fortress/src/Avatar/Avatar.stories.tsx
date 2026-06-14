import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './index';
import { Box } from '@mui/joy';
import { within, expect } from '@storybook/test';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Avatar',
  component: Avatar,
  // design: {
  //   type: 'figma',
  //   url: '',
  // },
} as Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Primary: Story = {
  args: {},
  parameters: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatars = await canvas.findAllByTestId('avatar');
    expect(avatars).toHaveLength(1); //验证数量
  },
  render: () => {
    return <Avatar data-testid="avatar"></Avatar>;
  },
};

export const InitialAvatars: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatars = canvas.getAllByTestId('avatar');
    expect(avatars).toHaveLength(4);
  },
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Avatar variant="solid" color="primary" data-testid="avatar">
        RE
      </Avatar>
      <Avatar variant="soft" data-testid="avatar" />
      <Avatar variant="outlined" data-testid="avatar" />
      <Avatar variant="plain" data-testid="avatar" />
    </Box>
  ),
};
export const AvatarVariants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Avatar variant="solid" color="primary" data-testid="avatar" />
      <Avatar variant="soft" data-testid="avatar" />
      <Avatar variant="outlined" data-testid="avatar" />
      <Avatar variant="plain" data-testid="avatar" />
    </Box>
  ),
};
export const AvatarSizes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatars = canvas.getAllByTestId('avatar');
    expect(avatars).toHaveLength(3);
  },
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Avatar size="sm" data-testid="avatar" />
      <Avatar size="md" data-testid="avatar" />
      <Avatar size="lg" data-testid="avatar" />
    </Box>
  ),
};
