import type { Meta, StoryObj } from '@storybook/react';
import { ShopTheLookList } from './shop-the-look-list';

const meta: Meta<typeof ShopTheLookList> = {
  title: 'CMS/Components/ShopTheLookList',
  component: ShopTheLookList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ShopTheLookList>;

const mockItems = [
  {
    _uid: 'item1',
    title: '春季新品系列',
    description: '探索我们的春季新品系列，展现独特时尚风格',
    image: {
      filename: 'https://picsum.photos/800/600',
      alt: '春季新品系列',
    },
    link: {
      url: '/collections/spring',
      text: '立即购买',
    },
  },
  {
    _uid: 'item2',
    title: '夏日精选',
    description: '为炎炎夏日准备的清爽搭配',
    image: {
      filename: 'https://picsum.photos/800/601',
      alt: '夏日精选',
    },
    link: {
      url: '/collections/summer',
      text: '查看详情',
    },
  },
  {
    _uid: 'item3',
    title: '秋季新品',
    description: '温暖舒适的秋季新品系列',
    image: {
      filename: 'https://picsum.photos/800/602',
      alt: '秋季新品',
    },
    link: {
      url: '/collections/autumn',
      text: '探索更多',
    },
  },
];

export const Default: Story = {
  args: {
    blok: {
      items: mockItems,
    },
  },
};

export const SingleItem: Story = {
  args: {
    blok: {
      items: [mockItems[0]],
    },
  },
};

export const TwoItems: Story = {
  args: {
    blok: {
      items: mockItems.slice(0, 2),
    },
  },
};
