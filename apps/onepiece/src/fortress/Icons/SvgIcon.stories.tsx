// SvgIcon.stories.ts,tsx

import type { Meta, StoryObj } from '@storybook/react';

import React, { useState } from 'react';
import { FontSize, Stack, SvgIcon, SvgIconProps, Typography, svgIconClasses, useTheme } from '@mui/joy';
import { Favorite, Castlery } from 'fortress/Icons';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/SvgIcon',
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
  args: {
    children: 'SvgIcon',
  },
  parameters: {},
};

export const fontSizes: Story = {
  args: {},
  parameters: {},
  render: () => {
    const theme = useTheme();
    let fontSizeType = ['default', ...Object.keys(theme.fontSize)];
    return (
      <Stack sx={(theme) => ({})} width={120} spacing={2}>
        {fontSizeType.map((fontSize) => {
          return (
            <Stack
              direction={'row'}
              justifyContent={'space-around'}
              alignItems={'center'}
              sx={{
                width: '10vw',
              }}
            >
              {fontSize === fontSizeType[0] ? (
                <>
                  <Typography>{fontSize}</Typography>
                  <Favorite />
                </>
              ) : (
                <>
                  <Typography>{fontSize}</Typography>
                  <Favorite fontSize={fontSize} />
                </>
              )}
            </Stack>
          );
        })}
      </Stack>
    );
  },
};

export const Logo = () => {
  return (
    <Castlery
      sx={{
        width: '178px',
      }}
    />
  );
};
