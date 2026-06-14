import type { Meta, StoryObj } from '@storybook/react';
import { ShopTheLookItem } from './shop-the-look-item';
import { HotspotsV2, TipsV2 } from '@castlery/modules-cms-domain';

const meta: Meta<typeof ShopTheLookItem> = {
  title: 'CMS/Components/ShopTheLookItem',
  component: ShopTheLookItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ShopTheLookItem>;

const mockHotspots: HotspotsV2[] = [
  {
    variant_id: '123',
    x: '20',
    y: '30',
    component: 'hotspot',
    name: 'Hotspot 1',
    popup: 'true',
    _editable: '',
    _uid: 'hotspot-1',
  },
  {
    variant_id: '456',
    x: '60',
    y: '70',
    component: 'hotspot',
    name: 'Hotspot 2',
    popup: 'true',
    _editable: '',
    _uid: 'hotspot-2',
  },
];

const mockTips: TipsV2[] = [
  {
    title: '这是一个提示信息',
    description: '这是提示的详细描述',
    x: '40',
    y: '50',
    component: 'tip',
    name: 'Tip 1',
    popup: 'true',
    variant_id: '789',
    _editable: '',
    _uid: 'tip-1',
  },
];

export const Default: Story = {
  args: {
    blok: {
      image: 'https://placehold.co/600x400',
      hotspots: mockHotspots,
      tips: mockTips,
      _uid: 'story-1',
    },
  },
};

export const WithoutTips: Story = {
  args: {
    blok: {
      image: 'https://placehold.co/600x400',
      hotspots: mockHotspots,
      tips: [],
      _uid: 'story-2',
    },
  },
};

export const WithoutHotspots: Story = {
  args: {
    blok: {
      image: 'https://placehold.co/600x400',
      hotspots: [],
      tips: mockTips,
      _uid: 'story-3',
    },
  },
};
