/* eslint-disable @typescript-eslint/no-unused-vars */
// Button.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { Button, ButtonProps } from '.';
import React from 'react';
import { Box, Stack, Grid, IconButton, Sheet, styled, Typography } from '@mui/joy';
import { ArrowRight, Favorite, Plus } from '../Icons';
import { withBrandColor } from '../hooks';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Button',
  component: Button,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=2%3A80&mode=dev',
    },
  },
} as Meta<ButtonProps>;
export default meta;

type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    children: 'Button',
  },
  parameters: {},

  render: () => {
    return <Button data-testId="button">Button</Button>;
  },
};

const ArrowButton = React.forwardRef(function ArrowButton(
  props: ButtonProps,
  forwardRef: React.ForwardedRef<HTMLElement>
) {
  // @ts-ignore
  return <Button startDecorator={<ArrowRight />} endDecorator={<ArrowRight />} {...props} ref={forwardRef}></Button>;
});

export const OldVariant: Story = {
  args: {},
  parameters: {
    variant: 'solid',
  },
  render: () => (
    <>
      <Stack direction={'row'} spacing={2}>
        <Stack sx={(theme) => ({})} spacing={2}>
          <ArrowButton variant="primary">primary</ArrowButton>
          <ArrowButton variant="secondary">secondary</ArrowButton>
          <ArrowButton variant="tertiary">tertiary</ArrowButton>
        </Stack>
        <Stack sx={(theme) => ({})} spacing={2}>
          <ArrowButton variant="primary" disabled>
            primary
          </ArrowButton>
          <ArrowButton variant="secondary" disabled>
            secondary
          </ArrowButton>
          <ArrowButton variant="tertiary" disabled>
            tertiary
          </ArrowButton>
        </Stack>
        <Stack sx={(theme) => ({})} spacing={2}>
          <ArrowButton variant="primary" loading>
            primary
          </ArrowButton>
          <ArrowButton variant="secondary" loading>
            secondary
          </ArrowButton>
          <ArrowButton variant="tertiary" loading>
            tertiary
          </ArrowButton>
        </Stack>
      </Stack>
    </>
  ),
};

export const NewVariant: Story = {
  args: {},
  render: () => (
    <>
      {['primary', 'success', 'warning', 'danger', 'neutral'].map((color) => (
        <Stack direction={'row'} spacing={2}>
          <Stack sx={(theme) => ({})} spacing={2}>
            <Button variant="solid" color={color}>
              solid
            </Button>
            <Button variant="outlined" color={color}>
              outlined
            </Button>
            <Button variant="plain" color={color}>
              plain
            </Button>
            <Button variant="soft" color={color}>
              soft
            </Button>
          </Stack>
          <Stack sx={(theme) => ({})} spacing={2}>
            <Button variant="solid" disabled color={color}>
              solid
            </Button>
            <Button variant="outlined" disabled color={color}>
              outlined
            </Button>
            <Button variant="plain" disabled>
              plain
            </Button>
            <Button variant="soft" disabled>
              soft
            </Button>
          </Stack>
          <Stack sx={(theme) => ({})} spacing={2}>
            <Button variant="solid" loading>
              solid
            </Button>
            <Button variant="outlined" loading>
              outlined
            </Button>
            <Button variant="plain" loading>
              plain
            </Button>
            <Button variant="soft" loading>
              soft
            </Button>
          </Stack>
        </Stack>
      ))}
    </>
  ),
};

export const Decorators: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button startDecorator={<Plus />}>Add to cart</Button>
      <Button aria-label="Like" variant="outlined" color="neutral">
        <Favorite />
      </Button>
      <Button variant="soft" endDecorator={<ArrowRight />} color="success">
        Checkout
      </Button>
    </Box>
  ),
};

export const Size: Story = {
  args: {},
  render: () => (
    <Stack direction={'row'} spacing={2}>
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </Stack>
  ),
};

export const BrandColorWithOutlined: Story = {
  args: {},
  parameters: {
    colorScheme: 'dark',
  },
  render: () => {
    // 所有品牌颜色
    const brandColors = [
      'burntOrange',
      'freshWaterBlue',
      'maroonVelvet',
      'rosewood',
      'terracotta',
      'leafGreen',
      'mono',
    ];

    // 所有变体
    const variants = ['solid', 'soft', 'outlined', 'plain'] as const;

    return (
      <Stack spacing={3} direction="column">
        {/* 品牌颜色 + 标准变体 */}
        <Box>
          <Typography level="h4" sx={{ mb: 2 }}>
            品牌颜色 + 标准变体
          </Typography>
          <Stack spacing={2} direction="column">
            {brandColors.map((color) => (
              <Box key={color}>
                <Typography level="body2" sx={{ mb: 1, fontWeight: 'lg' }}>
                  {color}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {variants.map((variant) => (
                    <Button
                      key={`${color}-${variant}`}
                      size="md"
                      variant={variant}
                      sx={{
                        ...withBrandColor(color, { variant }),
                        minWidth: '120px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {variant}
                    </Button>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography level="h4" sx={{ mb: 2 }}>
            状态演示 (primary + solid)
          </Typography>
          <Grid container spacing={1}>
            <Grid xs={6} sm={3}>
              <Button
                size="sm"
                variant="solid"
                sx={{
                  ...withBrandColor('burntOrange', { variant: 'solid' }),
                  width: '100%',
                }}
              >
                正常状态
              </Button>
            </Grid>
            <Grid xs={6} sm={3}>
              <Button
                size="sm"
                variant="solid"
                disabled
                sx={{
                  ...withBrandColor('burntOrange', { variant: 'solid' }),
                  width: '100%',
                }}
              >
                禁用状态
              </Button>
            </Grid>
            <Grid xs={6} sm={3}>
              <Button
                size="sm"
                variant="solid"
                loading
                sx={{
                  ...withBrandColor('burntOrange', { variant: 'solid' }),
                  width: '100%',
                }}
              >
                加载状态
              </Button>
            </Grid>
            <Grid xs={6} sm={3}>
              <Button
                size="sm"
                variant="solid"
                startDecorator={<Plus />}
                sx={{
                  ...withBrandColor('burntOrange', { variant: 'solid' }),
                  width: '100%',
                }}
              >
                带图标
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    );
  },
};

export const ImageButton: Story = {
  args: {},
  parameters: {
    colorScheme: 'dark',
  },
  render: () => (
    <>
      <Box display="flex" sx={{ mb: 2 }} gap={2} flexWrap="wrap">
        Warm Linen Solid
        <Button imageButtonModule startDecorator={<Plus />} variant="solid">
          Normal
        </Button>
        <Button imageButtonModule startDecorator={<Plus />} variant="solid" loading>
          Loading
        </Button>
        <Button imageButtonModule startDecorator={<Plus />} variant="solid" disabled>
          Disabled
        </Button>
      </Box>

      <Box display="flex" sx={{ mb: 2 }} gap={2} flexWrap="wrap">
        Warm Linen Outlined
        <Button imageButtonModule startDecorator={<Plus />} variant="outlined">
          Normal
        </Button>
        <Button imageButtonModule startDecorator={<Plus />} variant="outlined" loading>
          Loading
        </Button>
        <Button imageButtonModule startDecorator={<Plus />} variant="outlined" disabled>
          Disabled
        </Button>
      </Box>

      <Box display="flex" sx={{ mb: 2 }} gap={2} flexWrap="wrap">
        Warm Linen Plain
        <Button imageButtonModule startDecorator={<Plus />} variant="plain">
          Normal
        </Button>
        <Button imageButtonModule startDecorator={<Plus />} variant="plain" loading>
          Loading
        </Button>
        <Button imageButtonModule startDecorator={<Plus />} variant="plain" disabled>
          Disabled
        </Button>
      </Box>
    </>
  ),
};
