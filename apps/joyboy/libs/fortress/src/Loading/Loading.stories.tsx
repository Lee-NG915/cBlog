import { Loading } from './Loading';
import type { Meta, StoryObj } from '@storybook/react';
/**
 * Storybook story for the CircularProgress component.
 * Dev Doc  https://castlery.atlassian.net/wiki/spaces/EC/pages/2866872410/CDD
 * This component renders a CircularProgress and demonstrates its default usage.
 */

const meta = {
  title: 'Components/Loading',
  component: Loading,
  //https://storybook.js.org/docs/writing-stories/parameters
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=118-1926&m=dev',
    },
  },
} as Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof Loading>;

export const Primary: Story = {
  render: (args) => <Loading {...args} />,
};

export const Light: Story = {
  args: {
    theme: 'light',
  },
  render: (args) => <Loading {...args} />,
};

export const Dark: Story = {
  args: {
    theme: 'dark',
  },
  render: (args) => <Loading {...args} />,
};
