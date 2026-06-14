/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Badge.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import { Badge, BadgeProps } from '.';
import React, { useState } from 'react';
import { Box, Checkbox, Grid, IconButton, Sheet, Stack, Typography } from '..';
import { Add, Mail, Remove, ShoppingBag, Check } from '../Icons';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Badge',
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
    children: <Mail fontSize="xl3" data-testid="mailIcon" />,
  },
  parameters: {},
  render: ({ children }) => {
    return <Badge data-testid="backdrop_primary">{children}</Badge>;
  },
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

export function OptimizedBadgeShowcase() {
  return (
    <Stack spacing={4}>
      {/* 单字符和数字 - 应该显示为圆形 */}
      <Box>
        <Typography level="body2" sx={{ mb: 2 }}>
          Number or Character
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Badge badgeContent={1}>
            <ShoppingBag />
          </Badge>
          <Badge badgeContent={5}>
            <Mail />
          </Badge>
          <Badge badgeContent={9}>
            <ShoppingBag />
          </Badge>
          <Badge badgeContent="A">
            <Mail />
          </Badge>
          <Badge badgeContent="!">
            <ShoppingBag />
          </Badge>
        </Stack>
      </Box>

      {/* 双位数字 - 应该自动撑宽 */}
      <Box>
        <Typography level="body2" sx={{ mb: 2 }}>
          Double Digits
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Badge badgeContent={10}>
            <ShoppingBag />
          </Badge>
          <Badge badgeContent={25}>
            <Mail />
          </Badge>
          <Badge badgeContent={99}>
            <ShoppingBag />
          </Badge>
          <Badge badgeContent={100}>
            <Mail />
          </Badge>
        </Stack>
      </Box>

      {/* SVG 图标内容 */}
      <Box>
        <Typography level="body2" sx={{ mb: 2 }}>
          SVG Icon
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Badge
            badgeContent={<Add />}
            sx={{
              padding: 0,
              '& .MuiBadge-badge': {
                padding: 0,
              },
            }}
          >
            <ShoppingBag />
          </Badge>
          <Badge badgeContent={<Remove />}>
            <Mail />
          </Badge>
          <Badge badgeContent={<Check />}>
            <Mail />
          </Badge>
        </Stack>
      </Box>

      {/* 文字内容 - 应该自动撑宽 */}
      <Box>
        <Typography level="body2" sx={{ mb: 2 }}>
          Text
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Badge badgeContent="New">
            <ShoppingBag />
          </Badge>
          <Badge badgeContent="Hot">
            <Mail />
          </Badge>
          <Badge badgeContent="Sale">
            <ShoppingBag />
          </Badge>
          <Badge badgeContent="Limited">
            <Mail />
          </Badge>
        </Stack>
      </Box>

      {/* 不同颜色变体 */}
      <Box>
        <Typography level="body2" sx={{ mb: 2 }}>
          Color Variants
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center">
          <Badge badgeContent={5} color="primary">
            <ShoppingBag />
          </Badge>
          <Badge badgeContent={3} color="danger">
            <Mail />
          </Badge>
          <Badge badgeContent={8} color="success">
            <ShoppingBag />
          </Badge>
          <Badge badgeContent="New" color="warning">
            <Mail />
          </Badge>
        </Stack>
      </Box>
    </Stack>
  );
}
