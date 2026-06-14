import type { Meta, StoryObj } from '@storybook/react';
import { HorizontalScrollBox } from './horizontal-scroll-box';

const meta: Meta<typeof HorizontalScrollBox> = {
  component: HorizontalScrollBox,
  title: 'module/shared/HorizontalScrollBox',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof HorizontalScrollBox>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <HorizontalScrollBox />;
  },
};
