import type { Meta } from '@storybook/react';
import { LevelCubeLine } from './level-cube-line';

// import { within } from '@storybook/test';
// import { expect } from '@storybook/test';

const meta: Meta<typeof LevelCubeLine> = {
  component: LevelCubeLine,
  title: 'module/product/LevelCubeLine',
  argTypes: {},
};
export default meta;

export const Primary = {
  args: {
    ratingCapacity: 5,
    currentRating: 3,
  },
};

export const Long = {
  args: {
    ratingCapacity: 50,
    currentRating: 48,
  },
};
