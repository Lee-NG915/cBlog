/* eslint-disable @typescript-eslint/no-unused-vars */
// Tag.stories.ts|tsx
import { within, expect, userEvent } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import { QuantitySelector } from './QuantitySelector';
import { useState } from 'react';
import { Box, Typography, Button } from '@mui/joy';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Quantityselector',
  component: QuantitySelector,
  parameters: {
    // version: 'v2',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=74%3A275&mode=dev',
    },
  },

  argTypes: {
    min: {
      control: 'number',
      description: '最小值',
      defaultValue: 0,
    },
    max: {
      control: 'number',
      description: '最大值',
      defaultValue: 9,
    },
    step: {
      control: 'number',
      description: '步长',
      defaultValue: 1,
    },
    value: {
      control: 'number',
      description: '当前值',
    },
    defaultValue: {
      control: 'number',
      description: '默认值',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
      defaultValue: false,
    },
    loading: {
      control: 'boolean',
      description: '是否显示加载状态',
      defaultValue: false,
    },
    onChange: {
      action: 'changed',
      description: '值变化时的回调函数',
    },
  },
} satisfies Meta<typeof QuantitySelector>;

export default meta;

type Story = StoryObj<typeof QuantitySelector>;

export const Default: Story = {
  args: {
    min: 0,
    max: 9,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // 获取元素
    const incrementButton = canvas.getByLabelText('增加');
    const decrementButton = canvas.getByLabelText('减少');
    const input = canvas.getByLabelText(/Quantity Input/i);

    await step('初始值应为0', async () => {
      expect(input).toHaveAttribute('aria-valuenow', '0');
    });

    await step('点击增加按钮', async () => {
      await userEvent.click(incrementButton);
      expect(input).toHaveAttribute('aria-valuenow', '1');
    });

    await step('点击减少按钮', async () => {
      await userEvent.click(decrementButton);
      expect(input).toHaveAttribute('aria-valuenow', '0');
    });
  },
};

export const Disabled: Story = {
  args: {
    min: 0,
    max: 9,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 获取元素
    const incrementButton = canvas.getByLabelText('增加');
    const decrementButton = canvas.getByLabelText('减少');

    // 验证按钮已禁用
    expect(incrementButton).toBeDisabled();
    expect(decrementButton).toBeDisabled();
  },
};

export const WithCustomStep: Story = {
  args: {
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 20,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // 获取元素
    const incrementButton = canvas.getByLabelText('增加');
    const decrementButton = canvas.getByLabelText('减少');
    const input = canvas.getByLabelText(/Quantity Input/i);

    await step('验证初始值', async () => {
      expect(input).toHaveAttribute('aria-valuenow', '20');
    });

    await step('验证步长 - 增加', async () => {
      await userEvent.click(incrementButton);
      // 等待状态更新
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(input).toHaveAttribute('aria-valuenow', '30');
    });

    await step('验证步长 - 减少', async () => {
      await userEvent.click(decrementButton);
      // 等待状态更新
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(input).toHaveAttribute('aria-valuenow', '20');
    });
  },
};

export const LoadingState: Story = {
  args: {
    loading: true,
    defaultValue: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 获取元素
    const incrementButton = canvas.getByLabelText('增加');
    const decrementButton = canvas.getByLabelText('减少');

    // 验证按钮已禁用
    expect(incrementButton).toBeDisabled();
    expect(decrementButton).toBeDisabled();

    // 验证不存在Input元素，而是显示Loading
    expect(canvas.queryByLabelText(/Quantity Input/i)).toBeNull();
    expect(document.querySelector('span[role="progressbar"]')).toBeInTheDocument();
  },
};

// 交互式示例：模拟异步操作
export const LoadingInteractive: Story = {
  render: () => {
    const LoadingExample = () => {
      const [value, setValue] = useState(1);
      const [isLoading, setIsLoading] = useState(false);

      const handleChange = (newValue: number) => {
        setIsLoading(true);
        setValue(newValue);

        // 模拟异步操作
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      };

      const simulateLoad = () => {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      };

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography level="h5">交互式加载示例</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <QuantitySelector value={value} onChange={handleChange} loading={isLoading} />
            <Typography level="body1">点击加减按钮会触发1.5秒的加载状态</Typography>
          </Box>
          <Button onClick={simulateLoad} disabled={isLoading} sx={{ width: 'fit-content' }}>
            模拟加载状态
          </Button>
        </Box>
      );
    };

    return <LoadingExample />;
  },
};
