'use client';
import type { Meta, StoryObj } from '@storybook/react';
import { SwitchProps } from '@mui/joy/Switch';
import React from 'react';
import { Typography } from '../Typography/Typography';
import { Box } from '@mui/joy';
import { Switch } from './index';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Switch',
  component: Switch,

  argTypes: {
    checked: {
      control: 'boolean',
      description: '开关状态',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    endDecorator: {
      description: '开关后置装饰元素',
    },
  },
} satisfies Meta<SwitchProps>;

export default meta;

type Story = StoryObj<SwitchProps>;

const PrimaryComponent = () => {
  const [checked, setChecked] = React.useState<boolean>(false);
  return (
    <Box>
      <Switch
        checked={checked}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setChecked(event.target.checked)}
        endDecorator={checked ? 'On' : 'Off'}
        slotProps={{
          endDecorator: {
            sx: {
              minWidth: 24,
            },
          },
        }}
      />
    </Box>
  );
};

export const Primary: Story = {
  parameters: {
    docs: {
      description: {
        story: '演示 Switch 组件。',
      },
      source: {
        type: 'code',
        code: `
  const [checked, setChecked] = React.useState<boolean>(false);
       <Switch
        checked={checked}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setChecked(event.target.checked)}
        endDecorator={checked ? 'On' : 'Off'}
        slotProps={{
          endDecorator: {
            sx: {
              minWidth: 24,
            },
          },
        }}
      />
      `,
      },
    },
  },
  render: () => <PrimaryComponent />,
};

export const DisabledStates: Story = {
  render: () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Switch
          disabled
          endDecorator={<Typography>禁用状态 (关闭)</Typography>}
          slotProps={{
            endDecorator: {
              sx: {
                minWidth: 24,
              },
            },
          }}
        />

        <Switch
          disabled
          checked={true}
          endDecorator={<Typography>禁用状态 (开启)</Typography>}
          slotProps={{
            endDecorator: {
              sx: {
                minWidth: 24,
              },
            },
          }}
        />
      </Box>
    );
  },
};
