import React from 'react';
import {
  PosChooseFreeGiftDeliveryModal,
  PosChooseFreeGiftDeliveryModalProps,
} from './pos-chooseFreeGift-delivery-modal';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
/**
 * Storybook story for the PosChooseFreeGiftDeliveryModal component.
 * Dev Doc  https://castlery.atlassian.net/wiki/spaces/EC/pages/2866872410/CDD
 * This component renders a PosChooseFreeGiftDeliveryModal and demonstrates its default usage.
 */

const commonPlay = async ({ canvasElement }: any) => {
  const canvas = within(canvasElement);
  const e = canvas.getByText('Hello World!');
  expect(e).toBeInTheDocument();
};

const meta = {
  title: 'fortress/PosChooseFreeGiftDeliveryModal',
  component: PosChooseFreeGiftDeliveryModal,
  //https://storybook.js.org/docs/writing-stories/parameters
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
  //https://storybook.js.org/docs/api/doc-blocks/doc-block-argtypes
  argTypes: {
    title: {
      control: 'text',
    },
  },
  //https://storybook.js.org/docs/writing-stories/play-function
  play: commonPlay,
} as Meta<PosChooseFreeGiftDeliveryModalProps>;

export default meta;

type Story = StoryObj<PosChooseFreeGiftDeliveryModalProps>;

export const Primary: Story = {
  render: (args) => <PosChooseFreeGiftDeliveryModal {...args} />,
};

export const CustomTitle: Story = {
  args: {
    title: 'Hello World!',
  },
  render: (args) => <PosChooseFreeGiftDeliveryModal {...args} />,
};

CustomTitle.storyName = 'Custom Title';
