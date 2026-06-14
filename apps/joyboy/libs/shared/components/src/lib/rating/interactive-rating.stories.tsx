import type { Meta, StoryObj } from '@storybook/react';
import { InteractiveRating } from './interactive-rating';
import { useState } from 'react';

const meta: Meta<typeof InteractiveRating> = {
  title: 'Shared/InteractiveRating',
  component: InteractiveRating,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'number', min: 0, max: 5, step: 0.5 },
    },
    size: {
      control: { type: 'number', min: 10, max: 50, step: 2 },
    },
    margin: {
      control: { type: 'number', min: 0, max: 10, step: 1 },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基础故事
export const Default: Story = {
  args: {
    rating: 3,
    size: 20,
    margin: 2,
  },
};

// 测试交互逻辑的故事
export const InteractionLogic = () => {
  const [rating, setRating] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h3>交互测试</h3>
        <p>1. 默认状态：所有星星为空态</p>
        <p>2. 悬浮时：预展示填充状态</p>
        <p>3. 移出时：回到当前评分状态</p>
        <p>4. 点击时：确认新评分</p>
      </div>
      <InteractiveRating rating={rating} onRatingChange={setRating} />
      <div>当前评分: {rating}</div>
    </div>
  );
};

// 禁用状态
export const Disabled: Story = {
  args: {
    rating: 3,
    size: 20,
    margin: 2,
    disabled: true,
  },
};

// 不同大小
export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <div>
        <div>Small (16px)</div>
        <InteractiveRating rating={3} size={16} margin={1} />
      </div>
      <div>
        <div>Medium (24px)</div>
        <InteractiveRating rating={3} size={24} margin={2} />
      </div>
      <div>
        <div>Large (32px)</div>
        <InteractiveRating rating={3} size={32} margin={3} />
      </div>
    </div>
  ),
};

// 不同颜色
export const DifferentColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <div>
        <div>Default Colors</div>
        <InteractiveRating rating={3} size={20} margin={2} />
      </div>
      <div>
        <div>Custom Colors</div>
        <InteractiveRating rating={3} size={20} margin={2} outerColor="#FF6B6B" innerColor="#F0F0F0" />
      </div>
      <div>
        <div>Gold Theme</div>
        <InteractiveRating rating={3} size={20} margin={2} outerColor="#FFD700" innerColor="#E0E0E0" />
      </div>
    </div>
  ),
};
