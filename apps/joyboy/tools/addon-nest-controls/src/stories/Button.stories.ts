import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  tags: ['autodocs'],
  parameters: {
    myAddonParameter: `
<MyComponent boolProp scalarProp={1} complexProp={{ foo: 1, bar: '2' }}>
  <SomeOtherComponent funcProp={(a) => a.id} />
</MyComponent>
`,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Primary: Story = {
  // More on args: https://storybook.js.org/docs/react/writing-stories/args
  args: {
    primary: true,
    label: 'Button',
    blok: {
      _uid: 'd1ed47cc-a213-4ec9-8bda-6173290d54d5',
      button: [
        {
          id: 'buyNow_pla_button',
          _uid: '767e14f6-8b3a-4d39-a3b5-566db895bb0e',
          link: '',
          text: 'Add To Cart',
          variant: 'solid',
          component: 'button_v2',
          end_decorator: '',
          tracking_label: '',
          klaviyo_form_id: '',
          start_decorator: '',
          _editable:
            '<!--#storyblok#{"name": "button_v2", "space": "44267", "uid": "767e14f6-8b3a-4d39-a3b5-566db895bb0e", "id": "602967347"}-->',
        },
      ],
      show_cta: true,
      component: 'product_info_v2',
      show_price: true,
      data_source: 'product_info_banner',
      description_style: [
        {
          _uid: 'fb22de7d-febf-4e0e-a520-3b56ab7286f4',
          component: 'text_style_blok_v2',
          font_size: '24',
          text_color: {
            value: '#323433',
            plugin: 'storyblok-palette',
          },
          text_level: 'h3',
          font_family: 'Minerva Modern',
          mobile_font_size: '18',
          tablet_font_size: '24',
          desktop_font_size: '24',
          _editable:
            '<!--#storyblok#{"name": "text_style_blok_v2", "space": "44267", "uid": "fb22de7d-febf-4e0e-a520-3b56ab7286f4", "id": "602967347"}-->',
        },
      ],
      _editable:
        '<!--#storyblok#{"name": "product_info_v2", "space": "44267", "uid": "d1ed47cc-a213-4ec9-8bda-6173290d54d5", "id": "602967347"}-->',
    },
  },
};

export const Secondary: Story = {
  args: {
    label: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Button',
  },
};
