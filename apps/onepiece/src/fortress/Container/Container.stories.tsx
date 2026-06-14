import type { Meta, StoryObj } from '@storybook/react';

import { Container, ContainerProps } from '.';
import React, { useEffect, useState } from 'react';
import { Box, Grid, Sheet, Stack, Typography, styled } from 'fortress';
import { Breakpoint } from '@mui/system';
import { decorators } from './decorators';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / Container',
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

export function FixedAndFluidContainer() {
  let breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  return (
    <Stack
      sx={{
        bgcolor: (theme) => theme.palette.neutral[100],
        minHeight: '100vh',
      }}
    >
      <Box key={'Fortress'}>
        <Typography level="h1">Fortress</Typography>
        <Box>
          <Typography level="h2">Default</Typography>
          <Container>
            <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }}>
              <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
                {`<Container> --> <Container maxWidth='xl'>`}
              </Typography>
            </Box>
          </Container>
          <Container disableGutters>
            <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }}>
              <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
                {`<Container disableGutters>`}
              </Typography>
            </Box>
          </Container>
        </Box>
        <Box>
          <Typography level="h2">Fixed</Typography>
          <Typography level="body-sm">
            Set the max-width to match the min-width of the current breakpoint. This is useful if you'd prefer to design
            for a fixed set of sizes instead of trying to accommodate a fully fluid viewport. It's fluid by default.
          </Typography>
          <Container fixed>
            <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }}>
              <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
                {`<Container fixed>`}
              </Typography>
            </Box>
          </Container>
        </Box>
        <Box>
          <Typography level="h2">Fluid</Typography>
          <Typography level="body-sm">A fluid container width is bounded by the maxWidth prop value.</Typography>
          {breakpoints.map((maxWidth) => {
            return (
              <Container maxWidth={maxWidth} key={maxWidth}>
                <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }} alignItems={'center'} justifyContent={'center'}>
                  <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
                    {/* {maxWidth} */}
                    {`<Container maxWidth='${maxWidth}'>`}
                  </Typography>
                </Box>
              </Container>
            );
          })}
        </Box>
      </Box>

      <Box key={'Bootstrap'}>
        <Typography level="h1">Bootstrap</Typography>
        <Typography level="h2">Default(container-fluid)</Typography>
        <Box className="container-fluid">
          <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }}>
            <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
              {`container-fluid --> <Container disableGutters>`}
            </Typography>
          </Box>
        </Box>
        <Typography level="h2">Fixed(container)</Typography>
        <Container fixed>
          <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }}>
            <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
              {`container --> <Container fixed>`}
            </Typography>
          </Box>
        </Container>
        <Container>
          <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }}>
            <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
              {`container-large --> <Container> --> <Container maxWidth='xl'>`}
            </Typography>
          </Box>
        </Container>
        <Container maxWidth="md">
          <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }}>
            <Typography level="sub1" alignContent={'center'} textAlign={'center'}>
              {`container-small --> <Container maxWidth='md'>`}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Stack>
  );
}

export const disableGutters = () => {
  return (
    <Stack
      sx={{
        bgcolor: (theme) => theme.palette.neutral[100],
      }}
    >
      <Box>
        <Typography level="h1">Default</Typography>
        <Container>
          <Box sx={{ bgcolor: '#cfe8fc', height: '10vh' }} />
        </Container>
      </Box>
      <Box>
        <Typography level="h1">disableGutters</Typography>
        <Container disableGutters>
          <Box sx={{ bgcolor: '#cfe8fc', height: '10vh' }} />
        </Container>
      </Box>
    </Stack>
  );
};
