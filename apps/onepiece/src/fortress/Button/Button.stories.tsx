// Button.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import { Button, ButtonProps } from '.';
import React, { useState } from 'react';
import { Box, Stack, Grid, IconButton, Sheet, styled } from '@mui/joy';
import { ArrowRight, Favorite, Plus, Close } from 'fortress/Icons';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/Button',
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
};

let ArrowButton = React.forwardRef(function ArrowButton(
  props: ButtonProps,
  forwardRef: React.ForwardedRef<HTMLElement>
) {
  return <Button startDecorator={<ArrowRight />} endDecorator={<ArrowRight />} {...props} ref={forwardRef}></Button>;
});

export const Variant: Story = {
  args: {},
  parameters: {
    variant: 'solid',
  },
  render: () => (
    <Stack direction={'row'} spacing={2}>
      <Stack sx={(theme) => ({})} minWidth={100} spacing={2}>
        <ArrowButton variant="primary">solid</ArrowButton>
        <ArrowButton variant="secondary" color="neutral">
          outlined
        </ArrowButton>
        <ArrowButton variant="tertiary">plain</ArrowButton>
      </Stack>
      <Stack sx={(theme) => ({})} minWidth={100} spacing={2}>
        <ArrowButton variant="primary" disabled>
          solid
        </ArrowButton>
        <ArrowButton variant="secondary" color="neutral" disabled>
          outlined
        </ArrowButton>
        <ArrowButton variant="tertiary" disabled>
          plain
        </ArrowButton>
      </Stack>
    </Stack>
  ),
};

export const Decorators = () => {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button startDecorator={<Plus />}>Add to cart</Button>
      <Button aria-label="Like" variant="outlined" color="neutral">
        <Favorite />
      </Button>
      <Button variant="soft" endDecorator={<ArrowRight />} color="success">
        Checkout
      </Button>
    </Box>
  );
};
