import type { Meta, StoryObj } from '@storybook/react';
import { ProductsRecommendation } from './products-recommendation';

const meta: Meta<typeof ProductsRecommendation> = {
  component: ProductsRecommendation,
  title: 'module/product/ProductsRecommendation',
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
type Story = StoryObj<typeof ProductsRecommendation>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <ProductsRecommendation />;
  },
};
