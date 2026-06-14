'use client';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ShopTheLook, ShopTheLookProps } from './shop-the-look';
import { shopTheLook, shopTheLookData } from './mock';
import { setCMSData } from '@castlery/modules-cms-domain';
import { useDispatch } from 'react-redux';
// import { http, HttpResponse } from 'msw';
// const handlers = [
//   http.get('https://api-test.castlery.sg/variants?ids=26630%2C26624%2C26623%2C9188%2C26178%2C19803%2C26872', () => {
//     return HttpResponse.json(variantData);
//   }),
// ];
const meta = {
  title: 'fortress/cms/ShopTheLook',
  component: ShopTheLook,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/rCAKNNDsMcov8XW9rtCbsP/%5BASH%5D-PLA-Revamp?node-id=1252-52737&t=y0jYqETVrFsOZ3ga-4',
    },
    // msw: {
    // handlers: [...handlers],
    // },
  },
  decorators: [
    (Story) => {
      const dispatch = useDispatch();
      dispatch(
        setCMSData([
          {
            slug: 'shop-the-look',
            data: shopTheLookData.data?.story?.content || [],
          },
        ])
      );
      return <Story />;
    },
  ],
} as Meta<ShopTheLookProps>;
export default meta;
type Story = StoryObj<ShopTheLookProps>;
export const Primary: Story = {
  args: {},
  render: (args) => {
    return <ShopTheLook {...args} blok={shopTheLook} />;
  },
};
