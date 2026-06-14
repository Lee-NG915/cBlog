import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { AccountLogin, Favorite } from 'fortress/Icons';
import { Stack } from '@mui/joy';
import { IconButton, IconButtonProps } from '.';

const meta: Meta<typeof IconButton> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / IconButton',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=2%3A80&mode=dev',
    },
  },
  component: IconButton,
} as Meta<IconButtonProps>;

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Primary: Story = {
  args: {
    children: <Favorite />,
  },
  // render:{
  // return <IconButton></IconButton>
  // }
};

export const variants = () => (
  <Stack spacing={1} direction="row">
    <IconButton>
      <Favorite />
    </IconButton>
    <IconButton variant="plain">
      <Favorite />
    </IconButton>
    <IconButton variant="outlined">
      <Favorite />
    </IconButton>
    <IconButton variant="solid">
      <Favorite />
    </IconButton>
    <IconButton variant="soft">
      <Favorite />
    </IconButton>
  </Stack>
);
export const disabled = () => (
  <Stack spacing={1} direction="row">
    <IconButton
      disabled
      onClick={() => {
        alert('1');
      }}
    >
      <Favorite />
    </IconButton>
    <IconButton variant="primary" disabled>
      <Favorite />
    </IconButton>
    <IconButton variant="plain" disabled>
      <Favorite />
    </IconButton>
    {/* TODO 取消 hover状态的颜色  */}
    <IconButton variant="outlined" disabled>
      <Favorite />
    </IconButton>
    <IconButton variant="solid" disabled>
      <Favorite />
    </IconButton>
    <IconButton variant="soft" disabled>
      <Favorite />
    </IconButton>
  </Stack>
);
export const colors = () => (
  <Stack spacing={1} direction="row">
    <IconButton variant="plain" color="black">
      <Favorite />
    </IconButton>
    <IconButton variant="plain" color="primary">
      <Favorite />
    </IconButton>
    <IconButton variant="plain" color="neutral">
      <Favorite />
    </IconButton>
    <IconButton variant="plain" color="success">
      <Favorite />
    </IconButton>
  </Stack>
);
export const PlainVariant = () => (
  <IconButton aria-label="Favorite" variant="plain">
    <Favorite />
  </IconButton>
);
export const solidVariant = () => (
  <IconButton aria-label="Favorite" variant="solid">
    <Favorite />
  </IconButton>
);
export const LoginAccountX = () => (
  // <IconButton aria-label="Favorite" variant="solid">
  //   <Favorite></Favorite>
  // </IconButton>
  <AccountLogin />
);
