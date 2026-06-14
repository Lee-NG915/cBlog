/* eslint-disable prefer-const */
// Typography.stories.ts|tsx
/* eslint-disable react-hooks/rules-of-hooks */

import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '.';
import { Box, Link } from '../index';
import { Close, CheckCircle } from '../Icons';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Toast',
  component: Toast,

  argTypes: {
    theme: {
      options: ['light', 'dark'],
      control: { type: 'radio' },
      description: '主题风格',
    },
    anchorOrigin: {
      control: 'object',
      description: '显示位置',
    },
    open: {
      control: 'boolean',
      description: '是否显示',
    },
    onClose: {
      action: 'closed',
      description: '关闭时的回调函数',
    },
    actionSlot: {
      control: 'text',
      description: '操作按钮插槽',
    },
  },
  args: {
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
  },
  parameters: {
    layout: 'centered',
    // version: 'v2',
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: {
    theme: 'light',
    open: true,
  },
  render: (args) => {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Toast {...args} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} endDecorator={<Close />}>
          这是一个浅色主题提示。
        </Toast>
      </Box>
    );
  },
};

export const Dark: Story = {
  args: {
    theme: 'dark',
    open: true,
  },
  render: (args) => {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Toast {...args} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} endDecorator={<Close />}>
          这是一个浅色主题提示。
        </Toast>
      </Box>
    );
  },
};

export const WithDecorator: Story = {
  args: {
    theme: 'light',
    open: true,
  },
  render: (args) => {
    return (
      <Toast
        {...args}
        sx={{
          width: 300,
        }}
        startDecorator={<CheckCircle />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        endDecorator={<Close />}
      >
        Snackbar with icon and close affordance
      </Toast>
    );
  },
};

export const WithActionSlot: Story = {
  args: {
    theme: 'light',
    open: true,
  },
  render: (args) => {
    const ActionButton = <Link onClick={() => alert('Action clicked!')}>Action</Link>;

    return (
      <Box sx={{ height: 400, padding: 2 }}>
        <h4>切换设备查看不同布局</h4>

        <Box sx={{ marginBottom: 3 }}>
          <Toast {...args} actionSlot={ActionButton} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
            Simple message with action below
          </Toast>
        </Box>

        <Box sx={{ marginBottom: 3 }}>
          <Toast
            {...args}
            theme="dark"
            startDecorator={<CheckCircle />}
            endDecorator={<Close width={24} height={24} />}
            actionSlot={ActionButton}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            Snackbar with icon, action and close affordance
          </Toast>
        </Box>
      </Box>
    );
  },
};
