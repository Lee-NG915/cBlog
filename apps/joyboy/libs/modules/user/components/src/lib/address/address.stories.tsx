import type { Meta, StoryObj } from '@storybook/react';
import { CheckoutAddress } from './address';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof CheckoutAddress> = {
  component: CheckoutAddress,
  title: 'module/user/address',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?type=design&node-id=6489-3938&mode=dev',
    },
  },
};
export default meta;
type Story = StoryObj<typeof CheckoutAddress>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to Address!/gi)).toBeTruthy();
  },
};

// export { CheckoutAddress, SelectAddress };
