/* eslint-disable @typescript-eslint/no-unused-vars */
// SvgIcon.stories.ts,tsx

import type { Meta, StoryObj } from '@storybook/react';

import React, { useState } from 'react';
import { FontSize, Stack, SvgIcon, SvgIconProps, Typography, svgIconClasses, useTheme } from '@mui/joy';
import { Favorite, Castlery } from './index';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Castleryicon',
  component: SvgIcon,
  parameters: {
    design: {
      type: 'figma',
    },
  },
} as Meta<SvgIconProps>;
export default meta;

type Story = StoryObj<SvgIconProps>;
export const Primary: Story = {
  render: () => {
    return (
      <Castlery
        sx={{
          '--fortress-icon-width': '178px',
        }}
      />
    );
  },
};
export const color: Story = {
  render: () => {
    return (
      <>
        {['primary', 'secondary', 'error', 'info', 'success', 'warning'].map((color) => (
          <Castlery
            sx={{
              '--fortress-icon-width': '178px',
            }}
          />
        ))}
      </>
    );
  },
};
