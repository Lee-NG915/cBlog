// Button.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import React, { useState } from 'react';
import { Box, Stack, Grid, IconButton, Sheet, styled } from '@mui/joy';
import { ArrowRight, Favorite, Plus, Close } from '@castlery/fortress/Icons';
import { log } from 'console';
import ReviewSection from 'components/ReviewSection';
import { Provider } from 'react-redux';

import USPSection from './components/USPSection';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'page/Home',
  parameters: {
    design: {
      type: 'figma',
    },
  },
};
export default meta;

// type Story = StoryObj<ButtonProps>;

export const usp = () => <USPSection />;
export const reviewSection = () => <ReviewSection />;
