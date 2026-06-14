import type { Meta, StoryObj } from '@storybook/react';
import { InfoButton } from './info-button';

const meta: Meta<typeof InfoButton> = {
  component: InfoButton,
  title: 'module/product/InfoButton',
  argTypes: {},
};
export default meta;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Story = StoryObj<typeof InfoButton>;

export const Primary = {
  args: {
    innerStyle: {
      width: '14px',
      height: '14px',
    },
    tooltipTitle: 'More Info Here',
    placement: 'right',
    onClick: () => {
      window.alert('why you click!');
    },
  },
};
