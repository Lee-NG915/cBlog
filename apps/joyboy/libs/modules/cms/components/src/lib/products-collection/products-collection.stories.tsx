'use client';
import type { Meta, StoryObj } from '@storybook/react';
import { ProductsCollection, ProductsCollectionProps } from './products-collection';
import { Stack } from '@castlery/fortress';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress/cms/ProductsCollection',
  component: ProductsCollection,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/rCAKNNDsMcov8XW9rtCbsP/%5BASH%5D-PLA-Revamp?node-id=1213-18658&m=dev',
    },
  },
} as Meta<ProductsCollectionProps>;
export default meta;

type Story = StoryObj<ProductsCollectionProps>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return (
      <Stack>
        <ProductsCollection {...args} />
      </Stack>
    );
  },
};
