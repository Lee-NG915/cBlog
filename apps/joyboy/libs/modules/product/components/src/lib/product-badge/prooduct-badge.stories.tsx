import type { Meta, StoryObj } from '@storybook/react';
import { ProductBadge } from './product-badge';

const meta: Meta<typeof ProductBadge> = {
  component: ProductBadge,
  title: 'module/product/ProductBadge',
  argTypes: {},
};
export default meta;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Story = StoryObj<typeof ProductBadge>;

export const Primary = {
  args: {
    badgeList: ['Sale'],
  },
};
