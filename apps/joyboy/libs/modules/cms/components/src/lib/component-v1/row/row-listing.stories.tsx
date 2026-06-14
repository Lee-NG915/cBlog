import type { Meta, StoryObj } from '@storybook/react';
import { RowListing } from './row-listing';

const meta: Meta<typeof RowListing> = {
  title: 'CMS/Components/RowListing',
  component: RowListing,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RowListing>;

export const SingleItem: Story = {
  args: {
    blok: {
      _uid: 'row-listing-1',
      items: [
        {
          _uid: 'item-1',
          image: [],
          video: [],
          header: '单个项目标题',
          sub_header: '单个项目副标题',
          description: '这是单个项目的描述文本',
        },
      ],
    },
  },
};

export const ThreeItems: Story = {
  args: {
    blok: {
      _uid: 'row-listing-2',
      items: [
        {
          _uid: 'item-1',
          image: [],
          video: [],
          header: '项目1标题',
          sub_header: '项目1副标题',
          description: '项目1描述',
        },
        {
          _uid: 'item-2',
          image: [],
          video: [],
          header: '项目2标题',
          sub_header: '项目2副标题',
          description: '项目2描述',
        },
        {
          _uid: 'item-3',
          image: [],
          video: [],
          header: '项目3标题',
          sub_header: '项目3副标题',
          description: '项目3描述',
        },
      ],
    },
  },
};

export const WithAnchorLink: Story = {
  args: {
    blok: {
      _uid: 'row-listing-3',
      anchor_link: '#section-1',
      items: [
        {
          _uid: 'item-1',
          image: [],
          video: [],
          header: '带锚点的项目1',
          sub_header: '项目1副标题',
          description: '项目1描述',
        },
        {
          _uid: 'item-2',
          image: [],
          video: [],
          header: '带锚点的项目2',
          sub_header: '项目2副标题',
          description: '项目2描述',
        },
      ],
    },
  },
};

export const WithVideo: Story = {
  args: {
    blok: {
      _uid: 'row-listing-4',
      items: [
        {
          _uid: 'item-1',
          image: [],
          video: [],
          header: '视频项目',
          sub_header: '视频项目副标题',
          description: '这是一个包含视频的项目',
        },
      ],
    },
  },
};
