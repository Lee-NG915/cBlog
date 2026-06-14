/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
// Typography.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import { TypographyProps } from '@mui/joy/Typography';
import { Typography } from './Typography';
import React, { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid, Sheet, Table, useTheme } from '@mui/joy';
import { Stack, Box } from '..';
import { Close } from '../Icons';
import { within, expect } from '@storybook/test';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Typography',
  component: Typography,
} as Meta<TypographyProps>;
export default meta;

type Story = StoryObj<TypographyProps>;

export const Primary: Story = {
  args: {
    children: 'Typography',
  },
  parameters: {
    level: {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const saleTag = await canvas.findByText('Typography');
    expect(saleTag).toBeInTheDocument();
  },
};

const order = ['h1', 'h2', 'h3', 'h4', 'h5', 'subh1', 'subh2', 'subh3', 'body1', 'body2', 'caption1', 'caption2'];
const useCaseMap = {
  h1: 'Primary header',
  h2: 'Secondary header',
  h3: 'Tertiary header',
  h4: 'Progress indicator',
  h5: 'Progress indicator',
  subh1: 'Primary Subheader',
  subh2: 'Secondary Subheader',
  subh3: 'Tertiary Subheader',
  body1: 'Secondary Body',
  body2: 'Primary Body',
  caption1: `Footnote
  Primary Caption (Helper Text 1)`,
  caption2: `Secondary Caption (Helper Text 2)`,
};
export const h1 = () => <Typography level="h1">Typography</Typography>;
export const h2 = () => <Typography level="h2">Typography</Typography>;
export const h3 = () => <Typography level="h3">Typography</Typography>;
export const h4 = () => <Typography level="h4">Typography</Typography>;
export const h5 = () => <Typography level="h5">Typography</Typography>;
export const subh1 = () => <Typography level="subh1">Typography</Typography>;
export const subh2 = () => <Typography level="subh2">Typography</Typography>;
export const subh3 = () => <Typography level="subh3">Typography</Typography>;
export const body1 = () => <Typography level="body1">Typography</Typography>;
export const body2 = () => <Typography level="body2">Typography</Typography>;
export const caption1 = () => <Typography level="caption1">Typography</Typography>;
export const caption2 = () => <Typography level="caption2">Typography</Typography>;

export const Base = () => {
  const theme = useTheme();
  const isMobile = theme.breakpoints.down('md');
  return (
    <Table aria-label="basic table">
      <thead>
        <tr>
          <th></th>
          <th>fontFamily</th>
          {isMobile ? (
            <>
              <th>fontSize</th>
              <th>lineHeight</th>
            </>
          ) : (
            <>
              <th>fontWeight</th>
              <th>fontSize</th>
              <th>lineHeight</th>
              <th style={{ width: '26%' }}>Use Case</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {order.map((level, index) => {
          const [value, setValue] = useState({
            fontFamily: '',
            fontSize: '',
            fontWeight: '',
            lineHeight: '',
          });
          let label = level;
          if (label.includes('h')) {
            label = level.replace('h', 'Header');
          }

          // if (!value) return '';
          console.log(`==============>value`, value);
          let { fontFamily = '', fontSize = '', fontWeight = '', lineHeight = '' } = value || {};

          fontFamily = fontFamily?.split(',')[0];
          try {
            lineHeight =
              lineHeight === 'normal' ? 'Auto' : +lineHeight?.replace('px', '') / +fontSize?.replace('px', '') + '';
          } catch (error) {
            console.log(error);
          }

          const ref = useRef<HTMLSpanElement>(null);
          useEffect(() => {
            const el = ref?.current;
            if (!el) return;
            console.log(el);
            const { fontWeight, fontSize, fontFamily, lineHeight } = getComputedStyle(el);
            setValue({
              fontFamily,
              fontWeight,
              fontSize,
              lineHeight,
            });
          }, []);

          return (
            <tr key={level}>
              <td>
                <Typography level={level as any} ref={ref} color="danger">
                  {label}
                </Typography>
              </td>

              {isMobile ? (
                <>
                  <td>{fontWeight}</td>
                  <td>{fontSize}</td>
                  <td>{lineHeight === 'Auto' ? 'Auto' : (+lineHeight * 100).toFixed(0) + '%'}</td>
                </>
              ) : (
                <>
                  <td>{fontFamily}</td>
                  <td>{fontWeight}</td>
                  <td>{fontSize}</td>
                  <td>{lineHeight === 'Auto' ? 'Auto' : (+lineHeight * 100).toFixed(0) + '%'}</td>
                  {/* @ts-ignore */}
                  <td>{useCaseMap[level]}</td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export const Decorator = () => {
  return (
    <Stack>
      <Typography endDecorator={<Close />}>endDecorator </Typography>
      <Typography startDecorator={<Close />}>startDecorator</Typography>

      <Typography level="h1" startDecorator={<Close />}>
        Unable to add item to cart
      </Typography>

      <Typography level="h1" startDecorator={<Close />}>
        Unable to add item to cart h1
      </Typography>

      <Typography level="h2" endDecorator={<Close />}>
        Unable to add item to cart h2
      </Typography>

      <Typography level="h3" endDecorator={<Close />}>
        endDecorator h3
      </Typography>
    </Stack>
  );
};
