import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ContactUI } from './ContactUI';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'playground / ContactUI',
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/Jbl0kaMNNnzOxBvbtfcGMV/%5BASH%5D-2023-Q2-Quick-Wins?node-id=924%3A3553&mode=dev',
  },
};
export default meta;
type Story = StoryObj;

export const Subscription = () => <ContactUI />;
