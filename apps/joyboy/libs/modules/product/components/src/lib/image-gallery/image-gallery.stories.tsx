/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery } from './image-gallery';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';
import { fakeVariant } from './mock/mock';

const meta: Meta<typeof ImageGallery> = {
  component: ImageGallery,
  title: 'module/product/ImageGallery',
  argTypes: {},
};
export default meta;
type Story = StoryObj<typeof ImageGallery>;

export const Primary = {
  args: {
    images: fakeVariant.images,
    product: fakeVariant,
    assets: [],
  },
};
