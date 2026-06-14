// Divider.stories.ts|tsx
import React, { useState } from 'react';
import { Divider, DividerProps } from '.';
import type { Meta, StoryObj } from '@storybook/react';
import { Check, Close } from 'fortress/Icons';
import { Typography, List, ListItem, Box, FormControl, FormHelperText, Link, Stack, Container, Tag } from 'fortress';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/Divider',
  component: Divider,
} as Meta<DividerProps>;
export default meta;

type Story = StoryObj<DividerProps>;

export const Primary: Story = {
  args: {},
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
  render: (args) => {
    const content = (
      <Box sx={{ fontSize: 'sm', color: 'text.tertiary' }}>
        {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus id dignissim justo.
     Nulla ut facilisis ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus.
     Sed malesuada lobortis pretium.`}
      </Box>
    );

    return (
      <Stack spacing={1}>
        {content}
        <Divider>Visual indicator</Divider>
        {content}
        <Divider>
          <Tag>Visual indicator</Tag>
        </Divider>
        {content}
      </Stack>
    );
  },
};
export function VerticalDividerText() {
  const content = (
    <Box sx={{ fontSize: 'sm', color: 'text.tertiary' }}>
      {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus id dignissim justo.
   Nulla ut facilisis ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus.
   Sed malesuada lobortis pretium.`}
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Stack spacing={2} direction="row">
        {content}
        <Divider orientation="vertical">Visual indicator</Divider>
        {content}
      </Stack>
    </Container>
  );
}
