import type { Meta, StoryObj } from '@storybook/react';
import { BundleVariantSelector, VariantSelector } from './variant-selector';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

import { Card, Typography } from '@castlery/fortress';
import { Product } from '@castlery/modules-product-domain';
import { bundleProductMockData } from '../../mock/bundleProduct';
import { configurableProductMockData } from '../../mock/configurableProductMockData';
const meta: Meta<typeof VariantSelector> = {
  component: VariantSelector,
  title: 'module/product/VariantSelector',
  parameters: {
    // https://github.com/vercel/next.js/discussions/50068
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/product',
        query: {
          user: 'santa',
        },
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof VariantSelector>;

export const configurableType = {
  args: {
    productData: configurableProductMockData as Product,
  },
  render: ({ productData }: { productData: Product }) => {
    return (
      <VariantSelector
        options={productData.option_types}
        defaultVariant={productData.variants[0]}
        customizations={productData.customizations}
      />
    );
  },
};
export const bundleType = {
  args: {
    productData: bundleProductMockData as Product,
  },
  render: ({ productData }: { productData: Product }) => {
    return productData?.bundle_options?.map((bundle_option) => {
      return (
        <Card key={bundle_option.id}>
          <Typography level="h2">{bundle_option.presentation}</Typography>
          <BundleVariantSelector
            variants={bundle_option.variants}
            options={bundle_option.option_types}
            defaultVariant={bundle_option.variants[0]}
          />
        </Card>
      );
    });
  },
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to VariantSelector!/gi)).toBeTruthy();
  },
};
