'use client';
import type { Meta, StoryObj } from '@storybook/react';
import { ProductItemProps, ProductItem } from './product-item';
import { Stack } from '@castlery/fortress';
import { data } from './mock';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'module/product/ProductItem',
  component: ProductItem,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/rCAKNNDsMcov8XW9rtCbsP/%5BASH%5D-PLA-Revamp?node-id=1213-18658&m=dev',
    },
  },
} as Meta<ProductItemProps>;
export default meta;

type Story = StoryObj<ProductItemProps>;

export const Primary: Story = {
  args: {
    product: data.hits.hits[0]._source,
  },
  render: (args) => {
    return (
      <Stack>
        <ProductItem {...args} />
      </Stack>
    );
  },
};
