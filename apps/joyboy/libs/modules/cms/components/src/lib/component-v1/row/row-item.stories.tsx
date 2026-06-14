import type { Meta, StoryObj } from '@storybook/react';
import { RowItem } from './row-item';

const meta: Meta<typeof RowItem> = {
  title: 'CMS/Components/RowItem',
  component: RowItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RowItem>;

export const Basic: Story = {
  args: {
    blok: {
      _uid: 'row-item-1',
      header: '标题文本',
      sub_header: '副标题文本',
      description: '这是一段描述文本，用于展示组件的基本功能。',
      image: [
        {
          blok: {
            _uid: 'image-1',
            desktop_url: 'https://picsum.photos/800/600',
            alt: '示例图片',
          },
        },
      ],
    },
    ratio: 0.6223,
    needPadding: true,
  },
};

export const WithButton: Story = {
  args: {
    blok: {
      _uid: 'row-item-2',
      header: '带按钮的行项目',
      sub_header: '包含按钮的示例',
      description: '这个示例展示了如何在行项目中添加按钮。',
      image: [
        {
          blok: {
            _uid: 'image-2',
            desktop_url: 'https://picsum.photos/800/600',
            alt: '示例图片',
          },
        },
      ],
      button: [
        {
          _uid: 'button-1',
          text: '点击按钮',
          link: {
            url: '#',
            target: '_blank',
          },
        },
      ],
    },
    ratio: 0.6223,
    needPadding: true,
  },
};

export const WithIcon: Story = {
  args: {
    blok: {
      _uid: 'row-item-3',
      header: '带图标的行项目',
      sub_header: '包含图标的示例',
      description: '这个示例展示了如何在行项目中添加图标。',
      image: [
        {
          blok: {
            _uid: 'image-3',
            desktop_url: 'https://picsum.photos/800/600',
            alt: '示例图片',
          },
        },
      ],
      icon: {
        filename: 'https://picsum.photos/24/24',
        alt: '示例图标',
      },
    },
    ratio: 0.6223,
    needPadding: true,
  },
};

export const WithVideo: Story = {
  args: {
    blok: {
      _uid: 'row-item-4',
      header: '带视频的行项目',
      sub_header: '包含视频的示例',
      description: '这个示例展示了如何在行项目中添加视频。',
      video: [
        {
          blok: {
            _uid: 'video-1',
            desktop_url: 'https://example.com/video.mp4',
            autoplay: true,
            controls: true,
          },
        },
      ],
    },
    ratio: 0.6223,
    needPadding: true,
  },
};
