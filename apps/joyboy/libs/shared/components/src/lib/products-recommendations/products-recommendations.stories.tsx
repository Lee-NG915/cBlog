import type { Meta, StoryObj } from '@storybook/react';
import { ProductsRecommendations } from './products-recommendations';
import { recData } from './mock';

const meta: Meta<typeof ProductsRecommendations> = {
  component: ProductsRecommendations,
  title: 'module/shared/ProductsRecommendations',
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
type Story = StoryObj<typeof ProductsRecommendations>;

export const Primary: Story = {
  args: {
    title: 'Mid-Year Storewide Sale: Up to $400 Off',
    products: recData.slots,
  },
  render: (args) => {
    return <ProductsRecommendations {...args} />;
  },
};
