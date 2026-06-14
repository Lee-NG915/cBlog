import React from 'react';
import { TooltipEllipsis, TooltipEllipsisProps } from './TooltipEllipsis';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
/**
 * Storybook story for the TooltipEllipsis component.
 * Dev Doc  https://castlery.atlassian.net/wiki/spaces/EC/pages/2866872410/CDD
 * This component renders a TooltipEllipsis and demonstrates its default usage.
 */

const commonPlay = async ({ canvasElement }: any) => {
  const canvas = within(canvasElement);
  const e = canvas.getByText('Hello World!');
  expect(e).toBeInTheDocument();
};

const meta = {
  title: 'fortress/TooltipEllipsis',
  component: TooltipEllipsis,
  //https://storybook.js.org/docs/writing-stories/parameters
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
  //https://storybook.js.org/docs/api/doc-blocks/doc-block-argtypes
  argTypes: {
    title: {
      control: 'text',
    },
  },
  //https://storybook.js.org/docs/writing-stories/play-function
  play: commonPlay,
} as Meta<TooltipEllipsisProps>;

export default meta;

type Story = StoryObj<TooltipEllipsisProps>;

export const Primary: Story = {
  render: (args) => <TooltipEllipsis {...args} />,
};

export const CustomTitle: Story = {
  args: {
    title: 'Hello World!',
  },
  render: (args) => <TooltipEllipsis {...args} />,
};

CustomTitle.storyName = 'Custom Title';
