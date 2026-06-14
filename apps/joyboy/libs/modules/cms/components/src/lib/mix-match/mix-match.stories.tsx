// import type { Meta, StoryObj } from '@storybook/react';
// import { MixMatchCard } from './../mix-match-card';

// const meta: Meta<typeof MixMatchCard> = {
//   title: 'CMS/MixMatchCard',
//   component: MixMatchCard,
//   parameters: {
//     layout: 'centered',
//   },
//   tags: ['autodocs'],
// };

// export default meta;
// type Story = StoryObj<typeof MixMatchCard>;

// const defaultProps = {
//   blok: {
//     _uid: '123',
//     size: 'large',
//     background_color: '#ffffff',
//     header: '标题文本',
//     image: [
//       {
//         filename: 'https://picsum.photos/800/600',
//         alt: '示例图片',
//       },
//     ],
//     video: [],
//     text: '这是一段描述文本，可以包含富文本内容。',
//     link: [
//       {
//         text: '了解更多',
//         url: '#',
//       },
//     ],
//     direction: 'left',
//     text_color: '#3C101E',
//   },
// };

// export const Large: Story = {
//   args: defaultProps,
// };

// export const Medium: Story = {
//   args: {
//     ...defaultProps,
//     blok: {
//       ...defaultProps.blok,
//       size: 'medium',
//     },
//   },
// };

// export const Small: Story = {
//   args: {
//     ...defaultProps,
//     blok: {
//       ...defaultProps.blok,
//       size: 'small',
//     },
//   },
// };

// export const RightDirection: Story = {
//   args: {
//     ...defaultProps,
//     blok: {
//       ...defaultProps.blok,
//       direction: 'right',
//     },
//   },
// };

// export const WithVideo: Story = {
//   args: {
//     ...defaultProps,
//     blok: {
//       ...defaultProps.blok,
//       image: [],
//       video: [
//         {
//           url: 'https://example.com/video.mp4',
//           poster: 'https://picsum.photos/800/600',
//         },
//       ],
//     },
//   },
// };

// export const CustomColors: Story = {
//   args: {
//     ...defaultProps,
//     blok: {
//       ...defaultProps.blok,
//       background_color: '#f6f3e7',
//       text_color: '#1a1a1a',
//     },
//   },
// };

// export const NoText: Story = {
//   args: {
//     ...defaultProps,
//     blok: {
//       ...defaultProps.blok,
//       header: '',
//       text: '',
//     },
//   },
// };

export default {};
