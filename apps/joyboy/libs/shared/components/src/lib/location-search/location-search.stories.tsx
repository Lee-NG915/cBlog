import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LocationSearch, LocationSearchType } from './location-search';

const meta: Meta<typeof LocationSearch> = {
  component: LocationSearch,
  title: 'shared/LocationSearch',
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
type Story = StoryObj<typeof LocationSearch>;

export const Primary: Story = {
  args: {
    type: LocationSearchType.ZIPCODE,
    placeholder: 'Search zipcode',
    onSubmit: async (result) => {
      console.log('onSubmit', result);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      // await submit to backend
    },
  },
  render: (args) => {
    return <LocationSearch {...args} />;
  },
};
