import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Fab } from '.';
import { Grid, Stack } from '..';
import { Add, Search, Favorite } from '../Icons';

const meta = {
  title: 'Components/Fab',
  component: Fab,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=2%3A80&mode=dev',
    },
  },
} as Meta<typeof Fab>;

export default meta;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Story = StoryObj<typeof Fab>;

// 不同变体
export function Variants() {
  return (
    <Stack direction="row" spacing={6}>
      <Fab variant="primary">
        <Add />
      </Fab>
      <Fab variant="secondary">
        <Add />
      </Fab>
      <Fab variant="tertiary">
        <Add />
      </Fab>
    </Stack>
  );
}

// 不同大小
export function Sizes() {
  return (
    <Stack direction="row" spacing={2}>
      <Fab size="sm">
        <Add />
      </Fab>
      <Fab size="md">
        <Add />
      </Fab>
      <Fab size="lg">
        <Add />
      </Fab>
    </Stack>
  );
}

// 不同形状
export function Shapes() {
  return (
    <Stack direction="row" spacing={2}>
      <Fab shape="round">
        <Add />
      </Fab>
      <Fab shape="square">
        <Add />
      </Fab>
      <Fab shape="extended">
        <Add />
      </Fab>
    </Stack>
  );
}

// 不同图标
export function WithDifferentIcons() {
  return (
    <Grid container spacing={2}>
      <Grid xs={3}>
        <Fab>
          <Add />
        </Fab>
      </Grid>
      <Grid xs={3}>
        <Fab>
          <Favorite />
        </Fab>
      </Grid>
      <Grid xs={3}>
        <Fab>
          <Search />
        </Fab>
      </Grid>
    </Grid>
  );
}
