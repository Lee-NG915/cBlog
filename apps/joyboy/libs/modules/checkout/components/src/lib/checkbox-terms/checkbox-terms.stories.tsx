import type { Meta, StoryObj } from '@storybook/react';
import CheckboxTerms from './checkbox-terms';
import { Typography, Link } from '@castlery/fortress';
import React from 'react';

const meta: Meta<typeof CheckboxTerms> = {
  component: CheckboxTerms,
  title: 'module/checkout/CheckboxTerms',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=2027-16148&mode=dev',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof CheckboxTerms>;

export const Primary: Story = {
  args: {
    defaultChecked: true,
    labelElement: 'Free Assembly',
    helperTextElement:
      'Complimentary assembling service will be provided to all item(s) in your order that require assembling except Castlery’s Accessories.',
  },
  render: (args) => {
    return <CheckboxTerms {...args} />;
  },
};

export const WithLink: Story = {
  args: {
    labelElement: 'Free Assembly',
    helperTextElement: (
      <Typography level="caption2" sx={{ color: 'inherit' }}>
        Complimentary assembling service will be provided to all item(s) in your order that require assembling except
        <Link sx={{ ml: 0.5, color: 'inherit' }} underline="always">
          Castlery’s Accessories
        </Link>
        .
      </Typography>
    ),
  },
  render: (args) => {
    return <CheckboxTerms {...args} />;
  },
};
