/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';

import { Container, ContainerProps } from '.';
import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, useBreakpoints } from '..';
import { Breakpoint } from '@mui/system';
import { decorators } from './decorators';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Container',
  component: Container,
  parameters: {
    design: {
      type: 'figma',
    },
  },
  decorators,
} as Meta<ContainerProps>;
export default meta;

type Story = StoryObj<ContainerProps>;

export const Default: Story = {
  render: () => {
    return (
      <Stack
        sx={{
          minHeight: '100vh',
        }}
      >
        <Container sx={{ bgcolor: 'var(--fortress-palette-primary-50)', height: '40vh', width: '100%' }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'var(--fortress-palette-primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography level="h2" alignContent={'center'} textAlign={'center'}>
              Default
            </Typography>
          </Box>
        </Container>
      </Stack>
    );
  },
};
export const MaxWidthContainer: Story = {
  render: () => {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    return (
      <Stack
        sx={{
          minHeight: '100vh',
        }}
      >
        {breakpoints.map((maxWidth) => {
          return (
            <Container
              maxWidth={maxWidth}
              key={maxWidth}
              sx={{ bgcolor: 'var(--fortress-palette-primary-50)', height: '40vh' }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'var(--fortress-palette-primary-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography level="h2" alignContent={'center'} textAlign={'center'}>
                  {`maxWidth='${maxWidth}'`}
                </Typography>
              </Box>
            </Container>
          );
        })}
      </Stack>
    );
  },
};

export const disableGutters = () => {
  return (
    <Stack sx={{}}>
      <Box>
        <Typography level="h1">Default</Typography>
        <Container sx={{ bgcolor: 'var(--fortress-palette-primary-50)', height: '40vh', width: '100%' }}>
          <Box sx={{ height: '10vh', width: '100%', bgcolor: 'var(--fortress-palette-primary-100)' }} />
        </Container>
      </Box>
      <Box>
        <Typography level="h1">disableGutters</Typography>
        <Container disableGutters sx={{ bgcolor: 'var(--fortress-palette-primary-50)', height: '40vh', width: '100%' }}>
          <Box sx={{ height: '10vh', width: '100%', bgcolor: 'var(--fortress-palette-primary-100)' }} />
        </Container>
      </Box>
    </Stack>
  );
};
