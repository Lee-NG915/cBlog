/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { ButtonItemOption, ProductOptionsLine } from './product-options-line';

import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof ProductOptionsLine> = {
  component: ProductOptionsLine,
  title: 'module/product/ProductOptionsLine',
  argTypes: {
    onOptionSelectChange: { action: 'onOptionSelectChange executed!' },
  },
};
export default meta;
type Story = StoryObj<typeof ProductOptionsLine>;

export const Primary = {
  args: {
    selectedId: 360,
    id: 1,
    name: 'table',
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
};

export const Quantity = {
  args: {
    id: 1,
    name: 'quantity',
    displayType: ButtonItemOption.Quantity,
    presentation: 'Quantity',
    quantity: 1,
  },
};

// export const Heading: Story = {
//   args: {
//     selectedId: 0,
//     id: 0,
//     name: '',
//     presentation: '',
//     quantity: 0,
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     expect(canvas.getByText(/Welcome to ProductOptionsLine!/gi)).toBeTruthy();
//   },
// };
