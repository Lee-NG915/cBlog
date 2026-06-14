import type { Meta, StoryObj } from '@storybook/react';
import useInterval from './useInterval';
import React, { useState } from 'react';

const TestHooks = () => {
  const [index, setIndex] = useState(0);
  useInterval(() => {
    setIndex(index + 1);
  }, 1000);
  return <div>{index}</div>;
};

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'hooks / useInterval',
  // component: useInterval,
  component: useInterval,

  parameters: {
    component: TestHooks,
    componentSubtitle: 'a hook can replace which window provide interval to avoid run frequently',
  },
  argTypes: {
    callback: {
      description: 'call function regularly',
      control: 'object',
    },
    timeout: {
      description: 'set time about interval',
      defaultValue: 1000,
      control: 'number',
    },
  },
};

export default meta;

type Story = StoryObj<typeof useInterval>;

export const Primary: Story = {
  // args: {},
  // parameters: {},
  render: (args) => <TestHooks {...args} />,
};
