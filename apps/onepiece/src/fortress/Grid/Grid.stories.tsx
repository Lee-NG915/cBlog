// Grid.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import { Grid, GridProps } from '.';
import React, { useState } from 'react';
import { Box, Sheet, styled } from 'fortress';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / Grid',
  component: Grid,
  parameters: {
    design: {
      type: 'figma',
    },
  },
} as Meta<GridProps>;
export default meta;

type Story = StoryObj<GridProps>;

const Item = styled(Sheet)(({ theme }) => ({
  backgroundColor: theme.palette.primary[100],
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  borderRadius: 4,
  color: theme.vars.palette.text.secondary,
}));

export function VariableWidthGrid() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid xs="auto">
          <Item>variable width content</Item>
        </Grid>
        <Grid xs={6}>
          <Item>xs=6</Item>
        </Grid>
        <Grid xs>
          <Item>xs</Item>
        </Grid>
      </Grid>
    </Box>
  );
}

export function AutoGrid() {
  return (
    <Grid container spacing={3} sx={{ flexGrow: 1 }}>
      <Grid xs rowSpacing={'2'} columnSpacing={'1'}>
        <Item>xs</Item>
      </Grid>
      <Grid xs={6}>
        <Item>xs=6</Item>
      </Grid>
      <Grid xs>
        <Item>xs</Item>
      </Grid>
    </Grid>
  );
}
export function GridTemplate() {
  // https://caniuse.com/?search=grid-template-rows

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          gridTemplateRows: 'auto',
          gridTemplateAreas: `"header header header header"
  "sidebar . main main"
  "footer footer footer footer"`,
        }}
      >
        <Box maxWidth={'100px'} sx={{ gridArea: 'header', bgcolor: (theme) => theme.palette.primary[500] }}></Box>
        <Box sx={{ gridArea: 'main', bgcolor: (theme) => theme.palette.neutral[500] }}>Main</Box>
        <Box sx={{ gridArea: 'sidebar', bgcolor: (theme) => theme.palette.danger[500] }}>Sidebar</Box>
        <Box sx={{ gridArea: 'footer', bgcolor: (theme) => theme.palette.warning[500] }}>Footer</Box>
      </Box>
    </>
  );
}
