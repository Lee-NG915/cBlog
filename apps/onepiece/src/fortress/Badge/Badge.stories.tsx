// Badge.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import { Badge, BadgeProps } from '.';
import React, { useState } from 'react';
import { Box, Checkbox, Grid, IconButton, Sheet, Stack, Typography } from 'fortress';
import { Add, Mail, Remove, ShoppingBag } from 'fortress/Icons';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/Badge',
  component: Badge,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=236%3A2585&mode=dev',
    },
  },
} as Meta<BadgeProps>;
export default meta;

type Story = StoryObj<BadgeProps>;

export const Primary: Story = {
  args: {
    children: <Mail fontSize="xl3" />,
  },
  parameters: {},
};

export function Loading() {
  return (
    <IconButton size="md">
      <Badge badgeContent="200" loading>
        <ShoppingBag />
      </Badge>
    </IconButton>
  );
}
export function NumberBadge() {
  const [count, setCount] = React.useState(0);
  const [showZero, setShowZero] = React.useState(false);
  return (
    <Stack>
      <Stack direction={'row'} spacing={2} justifyContent={'center'}>
        <Badge badgeContent={0}>
          <Typography level="h1">🛍</Typography>
        </Badge>
        <Badge showZero badgeContent={0}>
          <Typography level="h1">🛍</Typography>
        </Badge>
        <Badge showZero badgeContent={1}>
          <Typography level="h1">🛍</Typography>
        </Badge>
        <Badge showZero badgeContent={2}>
          <Typography level="h1">🛍</Typography>
        </Badge>
        <Badge showZero badgeContent={8}>
          <Typography level="h1">🛍</Typography>
        </Badge>
        <Badge showZero badgeContent={18}>
          <Typography level="h1">🛍</Typography>
        </Badge>
        <Badge showZero badgeContent={88}>
          <Typography level="h1">🛍</Typography>
        </Badge>
      </Stack>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          mt: 4,
        }}
      >
        <Badge badgeContent={count} showZero={showZero}>
          <Typography level="h1">🛍</Typography>
        </Badge>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pt: 4,
            mb: 2,
            borderTop: '1px solid',
            borderColor: 'background.level1',
          }}
        >
          <IconButton size="sm" variant="outlined" onClick={() => setCount((c) => c - 1)}>
            <Remove />
          </IconButton>
          <Typography fontWeight="md" textColor="text.secondary">
            {count}
          </Typography>
          <IconButton size="sm" variant="outlined" onClick={() => setCount((c) => c + 1)}>
            <Add />
          </IconButton>
        </Box>
        <Checkbox onChange={(event) => setShowZero(event.target.checked)} checked={showZero} label="show zero" />
      </Box>
    </Stack>
  );
}
export function BadgeMax() {
  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Badge badgeContent={99}>
        <Mail fontSize="xl4" />
      </Badge>
      <Badge badgeContent={100} badgeInset="0 -6px 0 0">
        <Mail fontSize="xl4" />
      </Badge>
      <Badge badgeContent={1000} max={999} badgeInset="0 -12px 0 0">
        <Mail fontSize="xl4" />
      </Badge>
    </Box>
  );
}

export function BadgeSizes() {
  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Badge badgeContent={1} size="sm">
        <Typography fontSize="xl">💌</Typography>
      </Badge>
      <Badge badgeContent={10} size="sm">
        <Typography fontSize="xl">💌</Typography>
      </Badge>
      <Badge badgeContent={2} size="md">
        <Typography fontSize="xl">💌</Typography>
      </Badge>
      <Badge badgeContent={20} size="md">
        <Typography fontSize="xl">💌</Typography>
      </Badge>
      <Badge badgeContent={3} size="lg">
        <Typography fontSize="xl">💌</Typography>
      </Badge>
      <Badge badgeContent={30} size="lg">
        <Typography fontSize="xl">💌</Typography>
      </Badge>
    </Box>
  );
}
