import type { Meta, StoryObj } from '@storybook/react';
import { ProductRecommendationItem } from './product-recommendation-item';

const meta: Meta<typeof ProductRecommendationItem> = {
  component: ProductRecommendationItem,
  title: 'module/shared/ProductRecommendationItem',
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
type Story = StoryObj<typeof ProductRecommendationItem>;

export const Primary: Story = {
  args: {
    name: 'Adams Chaise Sectional Sofa. Adams Collection. Sectional Sofas, Sofas, Living Room Furniture',
    description: 'Adams Chaise Sectional Sofa. Adams Collection. Sectional Sofas, Sofas, Living Room Furniture',
    price: '1999',
    strikeThroughPrice: '2099',
    tag: 'Adams Collection',
  },
  render: (args) => {
    return <ProductRecommendationItem {...args} />;
  },
};
