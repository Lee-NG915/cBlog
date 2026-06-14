import type { Meta, StoryObj } from '@storybook/react';
import { ProductOptionsLineGroup } from './product-options-line-group';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';
import { ButtonItemOption } from './product-options-line';

const meta: Meta<typeof ProductOptionsLineGroup> = {
  component: ProductOptionsLineGroup,
  title: 'module/product/ProductOptionsLineGroup',
  argTypes: {
    onOptionSelectChange: { action: 'onOptionSelectChange executed!' },
  },
};
export default meta;
type Story = StoryObj<typeof ProductOptionsLineGroup>;

export const Primary = {
  args: {
    optionSelected: {
      bench: 348,
      chair_material: 353,
      chairs_qty: 349,
      quantity: 1,
      table_length: 360,
    },
    optionTypes: [
      {
        name: 'table_length',
        displayType: ButtonItemOption.Button,
        presentation: 'Table Length',
        values: [
          {
            color: null,
            id: 360,
            image_url: '',
            name: 'table_180cm',
            presentation: '180cm',
          },
          {
            color: null,
            id: 361,
            image_url: '',
            name: 'table_150cm',
            presentation: '150cm',
          },
        ],
      },
      {
        name: 'bench',
        displayType: ButtonItemOption.Button,
        presentation: 'Bench',
        values: [
          {
            color: null,
            id: 348,
            image_url: '',
            name: 'no_bench',
            presentation: 'No Bench',
          },
          {
            color: null,
            id: 358,
            image_url: '',
            name: '130_bench',
            presentation: '130cm Bench',
          },
          {
            color: null,
            id: 359,
            image_url: '',
            name: '160_bench',
            presentation: '160cm Bench',
          },
        ],
      },
      {
        displayType: ButtonItemOption.Quantity,
        presentation: 'Quantity',
      },
    ],
  },
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ProductOptionsLineGroup!/gi)).toBeTruthy();
  },
};
