/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
// Tooltip.stories.ts|tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './';
// import type { TooltipProps } from './Tooltip';
import React, { useState } from 'react';
import { Button, Grid, Box, Typography } from '../index';
import { Close } from '../Icons';
// 共用的 Tooltip 渲染函数
const renderTooltip = (
  theme: 'light' | 'dark',
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  titleContent: JSX.Element | string
) => (
  <Grid container width="100%" height={150} alignItems="end" justifyContent="center">
    <Tooltip
      arrow
      open={open}
      theme={theme}
      placement="top"
      title={
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography
              level="subh2"
              sx={{
                color: theme === 'dark' ? '#ffffff' : '',
              }}
            >
              Title
            </Typography>
            <Close onClick={() => setOpen(false)} />
          </Box>
          <Box>{titleContent}</Box>
        </>
      }
    >
      <span>
        <Button role="button" sx={{ width: 200, height: 60 }} onClick={() => setOpen(!open)}>
          {theme}
        </Button>
      </span>
    </Tooltip>
  </Grid>
);

/**
 * Tooltip 组件用于在用户hover或focus某个元素时显示提示信息
 */
const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,

  argTypes: {
    theme: {
      options: ['light', 'dark'],
      control: { type: 'radio' },
      description: '主题风格',
    },
    placement: {
      options: ['top', 'bottom', 'left', 'right'],
      control: { type: 'radio' },
      description: '显示位置',
    },
    title: {
      control: 'text',
      description: '提示内容',
    },
  },
  args: {
    arrow: true,
    placement: 'top',
    theme: 'light',
    title: 'Tooltip on the Top',
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/fVMqBlKxsgoBF1hGt9O5bW/%5BWebsite%5D-2024-Q3-Quick-Fixes?node-id=2003-9239&m=dev',
    },
  },
  render: (args) => (
    <Box sx={{ p: 2 }}>
      <Tooltip {...args}>
        <Button variant="outlined">Tooltip</Button>
      </Tooltip>
    </Box>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    theme: 'light',
    children: <Button variant="outlined">Tooltip</Button>,
  },
};

export const Dark: Story = {
  args: {
    theme: 'dark',
    children: <Button variant="outlined">Tooltip</Button>,
  },
  // play: playCommon,
  render: () => (
    <Grid container width="100%" height={100} alignItems="end" justifyContent="center">
      <Tooltip arrow type="dark" placement="top" title={<span>Tooltip on the Top</span>}>
        <Button variant="outlined">Tooltip</Button>
      </Tooltip>
    </Grid>
  ),
};

export const LightWithClose: Story = {
  args: {
    theme: 'light',
    children: <Button variant="outlined">Tooltip</Button>,
  },
  // play: playVariant,
  render: () => {
    const [open, setOpen] = useState(true);
    return renderTooltip('light', open, setOpen, 'The users wants to find a specific page or site.');
  },
  parameters: {
    docs: {
      source: {
        code: `
<Tooltip
  arrow
  open={open}
  theme="light"
  placement="top"
  title={
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography level="subh2">Title</Typography>
        <Close onClick={() => setOpen(false)} />
      </Box>
      <Box>The users wants to find a specific page or site.</Box>
    </>
  }
>
  <span>
    <Button role="button" onClick={() => setOpen(!open)}>
      light
    </Button>
  </span>
</Tooltip>`,
      },
    },
  },
};

export const DarkWithClose: Story = {
  args: {
    theme: 'dark',
    children: <Button variant="outlined">Tooltip</Button>,
  },
  // play: playVariant,
  render: () => {
    const [open, setOpen] = useState(true);
    return renderTooltip('dark', open, setOpen, 'The users wants to find a specific page or site.');
  },
  parameters: {
    docs: {
      source: {
        code: `
<Tooltip
  arrow
  open={open}
  theme="dark"
  placement="top"
  title={
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography level="subh2">Title</Typography>
        <Close onClick={() => setOpen(false)} />
      </Box>
      <Box>The users wants to find a specific page or site.</Box>
    </>
  }
>
  <span>
    <Button role="button" onClick={() => setOpen(!open)}>
      light
    </Button>
  </span>
</Tooltip>`,
      },
    },
  },
};
