// Button.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import React, { useState, useEffect } from 'react';
import { loadIfNeeded as loadProduct, updateVariantPrice } from 'redux/modules/products';

import { useDispatch } from 'react-redux';
import ProductSocialWidget from './components/ProductSocialWidget';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'page/Product',
  parameters: {
    design: {
      type: 'figma',
    },
  },
};
export default meta;

// type Story = StoryObj<ButtonProps>;

export const productSocialWidget = () => 1;
