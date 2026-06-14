import type { Meta, StoryObj } from '@storybook/react';

import ProductPropertyExpand from './product-property-expand';

const meta: Meta<typeof ProductPropertyExpand> = {
  component: ProductPropertyExpand,
  title: 'module/product/ProductPropertyExpand',
  argTypes: {
    // onOptionSelectChange: { action: 'onOptionSelectChange executed!' },
  },
};
export default meta;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Story = StoryObj<typeof ProductPropertyExpand>;

export const Primary = {
  args: {
    propertyName: 'Product Features',
    contentList: [
      {
        explanation: null,
        is_private: false,
        is_public: true,
        name: 'fabric_composition',
        presentation: 'Fabric Composition',
        value: '100% Polyester',
      },
      {
        explanation: null,
        is_private: false,
        is_public: true,
        name: 'finish',
        presentation: 'Finish',
        value: 'Muted Honey Tone and Wire Brush Distressed Finish; Black Powdercoating Handle',
      },
    ],
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
