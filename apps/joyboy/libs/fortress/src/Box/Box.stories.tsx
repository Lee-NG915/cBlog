import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Box, Typography } from '@castlery/fortress';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SimpleResponsive: Story = {
  name: 'Simple Responsive sx',
  render: () => (
    <Box
      sx={{
        // 基础样式（未匹配任何断点时的默认样式）
        padding: 16,
        backgroundColor: 'lightgray',
        borderRadius: 8,
        color: 'white',
        // mobile: 0-599px（独占）
        mobile: {
          backgroundColor: 'green',
          padding: 8,
        },
        // tablet: 600-899px（独占）
        tablet: {
          backgroundColor: 'orange',
          padding: 16,
        },
        // desktop: 900px+
        desktop: {
          backgroundColor: 'black',
          padding: 32,
        },
      }}
    >
      <Typography level="body1" sx={{ color: 'white' }}>
        <strong>响应式断点规范（与 useBreakpoints 一致）：</strong>
        <br />
        <br />
        Mobile (0-599px): 绿色背景，padding 8px
        <br />
        Tablet (600-899px): 橙色背景，padding 16px
        <br />
        Desktop (900px+): 黑色背景，padding 32px
        <br />
        <br />
        调整浏览器窗口大小查看变化
      </Typography>
    </Box>
  ),
};

export const PartialBreakpoints: Story = {
  name: 'Partial Breakpoints (Only Mobile & Desktop)',
  render: () => (
    <Box
      sx={{
        padding: 16,
        backgroundColor: 'purple',
        borderRadius: 8,
        color: 'white',
        // 只定义 mobile 和 desktop，tablet 会使用基础样式
        mobile: {
          backgroundColor: 'blue',
          padding: 12,
        },
        desktop: {
          backgroundColor: 'red',
          padding: 24,
        },
      }}
    >
      <Typography level="body1" sx={{ color: 'white' }}>
        <strong>部分断点示例：</strong>
        <br />
        <br />
        📱 Mobile (0-599px): 蓝色背景，padding 12px
        <br />
        📱 Tablet (600-899px): 紫色背景（基础样式），padding 16px
        <br />
        💻 Desktop (900px+): 红色背景，padding 24px
        <br />
        <br />
        注意：Tablet 使用基础样式，不受 mobile 影响
      </Typography>
    </Box>
  ),
};

export const ResponsiveLayout: Story = {
  name: 'Responsive sx blocks',
  render: () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: (theme) => theme.spacing(2),
        padding: (theme) => theme.spacing(4),
        borderRadius: (theme) => theme.spacing(2),
        border: (theme) => `1px solid ${theme.palette.brand.mono[300]}`,
        backgroundColor: (theme) => theme.palette.brand.warmLinen[800],
        tablet: {
          flexDirection: 'row',
        },
        desktop: {
          padding: 32,
          gap: 24,
          backgroundColor: (theme) => theme.palette.brand.warmLinen[100],
        },
      }}
    >
      {['Overview', 'Details', 'Actions'].map((label) => (
        <Box
          key={label}
          sx={(theme) => ({
            flex: 1,
            padding: theme.spacing(3),
            borderRadius: theme.spacing(1),
            desktop: {
              minHeight: 160,
            },
          })}
        >
          <Typography level="subh2" sx={{ textTransform: 'uppercase', mb: 1 }}>
            {label}
          </Typography>
          <Typography level="body2">
            This block uses `base/tablet/desktop` keys inside `sx` to switch layout without manual breakpoint checks.
          </Typography>
        </Box>
      ))}
    </Box>
  ),
};
