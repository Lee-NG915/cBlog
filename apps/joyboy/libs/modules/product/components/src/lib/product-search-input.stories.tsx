import type { Meta, StoryObj } from '@storybook/react';
import { ProductOptionItem, ProductSearchInput } from './product-search-input';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof ProductSearchInput> = {
  component: ProductSearchInput,
  title: 'module/product/ProductSearchInput',
};
export default meta;
type Story = StoryObj<typeof ProductSearchInput>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ProductSearchInput!/gi)).toBeTruthy();
  },
};

export const Items: Story = {
  args: {
    options: {
      name: 'Jonathan Sofa',
      name_highlight: 'Jonathan <em>Sofa</em>',
      type: 'product',
      slug: 'jonathan-sofa',
      default_taxon: 'sofa-armchairs/3-seater-sofas',
      image:
        'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_280/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
    },
    // selected:
  },
  render: ({ options }, ...rest) => {
    console.log('🚀 ~ file: product-search-input.stories.tsx:29 ~ rest:', rest);
    return <ProductOptionItem options={options} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ProductSearchInput!/gi)).toBeTruthy();
  },
};
