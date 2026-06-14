import type { Meta, StoryObj } from '@storybook/react';
import Swiper from '.';
import React from 'react';

interface simpleDivProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
}

const SimpleDiv = ({ text }: simpleDivProps) => {
  return <div style={{ width: '75px', height: '30px', textAlign: 'center' }}>{text}</div>;
};

const PrimarySwiper = ({
  direction = 'to-bottom',
}: {
  direction?: 'to-bottom' | 'to-top' | 'to-left' | 'to-right';
}) => {
  const testArr = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const simpleDivArr: React.ReactNode[] = [];
  testArr.forEach((item) => {
    simpleDivArr.push(<SimpleDiv text={item} />);
  });

  return <Swiper direction={direction} children={simpleDivArr} />;
};

const meta = {
  title: 'playground / Swiper',
  component: Swiper,
  parameters: {
    component: PrimarySwiper,
    componentSubtitle: 'a simple swiper',
  },
  argTypes: {},
} as Meta<typeof Swiper>;

export default meta;
type Story = StoryObj<typeof Swiper>;

export const Primary: Story = {
  args: {
    direction: 'to-bottom',
  },
  // parameters: {},
  render: ({ ...args }) => <PrimarySwiper {...args} />,
};
