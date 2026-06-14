import { ProgressBar, ProgressBarProps } from './ProgressBar';
import type { Meta, StoryObj } from '@storybook/react';
/**
 * Storybook story for the LinearProgress component.
 * Dev Doc  https://castlery.atlassian.net/wiki/spaces/EC/pages/2866872410/CDD
 * This component renders a LinearProgress and demonstrates its default usage.
 */

const meta = {
  title: 'Components/Progressbar',
  component: ProgressBar,
  //https://storybook.js.org/docs/writing-stories/parameters
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=11404-5880&m=dev',
    },
  },
  //https://storybook.js.org/docs/api/doc-blocks/doc-block-argtypes
  args: {
    value: 10,
    color: 'primary',
  },
  //https://storybook.js.org/docs/writing-stories/play-function
} as Meta<ProgressBarProps>;

export default meta;

type Story = StoryObj<ProgressBarProps>;

export const Primary: Story = {
  render: (args) => <ProgressBar color="primary" {...args} />,
};

export const Progress: Story = {
  render: (args) => <ProgressBar determinate sx={{ width: '100%' }} {...args} />,
};
