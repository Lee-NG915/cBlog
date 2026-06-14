import useBreakpoints from '../';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'fortress/Hooks/useBreakpoints',
};

export default meta;

const Default = () => {
  const { xs, sm, md, lg, xl, mobile, desktop, tablet } = useBreakpoints();
  return (
    <div>
      <div>xs: {xs.toString()}</div>
      <div>sm: {sm.toString()}</div>
      <div>md: {md.toString()}</div>
      <div>lg: {lg.toString()}</div>
      <div>xl: {xl.toString()}</div>
      <div>mobile: {mobile.toString()}</div>
      <div>tablet: {tablet.toString()}</div>
      <div>desktop: {desktop.toString()}</div>
    </div>
  );
};

export const Demo: StoryObj = {
  parameters: {
    docs: {
      description: {
        story: 'Class component please use `withUseBreakpoints` HOC. \n',
      },
      source: {
        code: `import useBreakpoints from 'fortress/hooks/useBreakpoints';
        
const Default = () => {
  const { xs, sm, md, lg, xl, mobile, desktop, tablet } = useBreakpoints();
  return (
    <div>
      <div>xs: {xs.toString()}</div>
      <div>sm: {sm.toString()}</div>
      <div>md: {md.toString()}</div>
      <div>lg: {lg.toString()}</div>
      <div>xl: {xl.toString()}</div>
      <div>mobile: {mobile.toString()}</div>
      <div>tablet: {tablet.toString()}</div>
      <div>desktop: {desktop.toString()}</div>
    </div>
  );
};`,
      },
    },
  },
  render: () => <Default />,
};
