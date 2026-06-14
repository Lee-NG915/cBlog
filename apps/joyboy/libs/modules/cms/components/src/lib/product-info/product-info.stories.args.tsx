/**
 * Generated ArgTypes for ProductInfo.
 * You can import this in your .stories.tsx
 */

export const ProductInfoArgTypes = {
  data_source: {
    name: 'data_source',
    description: '',
    control: {
      type: 'radio',
      options: ['product_info_banner'],
    },
  },
  description_style: [
    {
      text_level: {
        name: 'text_level',
        description: '',
        control: {
          type: 'select',
          options: ['h1', 'h2', 'h3', 'subh1', 'subh2', 'body1', 'body2', 'caption1', 'caption2'],
        },
      },
      text_color: {
        name: 'text_color',
        description: '',
        control: {
          type: 'color',
          presetColors: ['#A45B37', '#77837A', '#323433', '#C1AF86', '#DBCFB5', '#FFFDF9'],
          defaultValue: '#323433',
        },
      },
      font_family: {
        name: 'font_family',
        description: '',
        control: {
          type: 'radio',
          options: ['Minerva Modern'],
        },
      },
      desktop_font_size: {
        name: 'desktop_font_size',
        description: '',
        control: 'number',
      },
      tablet_font_size: {
        name: 'tablet_font_size',
        description: '',
        control: 'number',
      },
      mobile_font_size: {
        name: 'mobile_font_size',
        description: '',
        control: 'number',
      },
    },
  ],
  button: [
    {
      text: {
        name: 'text',
        description: 'Button text',
        control: 'text',
      },
      variant: {
        name: 'variant',
        description: '',
        control: {
          type: 'radio',
          options: ['solid', 'secondary', 'tertiary'],
        },
      },
      link: {
        name: 'link',
        description: '',
        control: 'text',
      },
      start_decorator: {
        name: 'start_decorator',
        description: '',
        control: {
          type: 'radio',
          options: ['ArrowLeft'],
        },
      },
      end_decorator: {
        name: 'end_decorator',
        description: '',
        control: {
          type: 'radio',
          options: ['ArrowRight'],
        },
      },
      klaviyo_form_id: {
        name: 'klaviyo_form_id',
        description: '',
        control: 'text',
      },
      tracking_label: {
        name: 'tracking_label',
        description: '',
        control: 'text',
      },
      id: {
        name: 'id',
        description: '',
        control: 'text',
      },
      data_selenium: {
        name: 'data_selenium',
        description: '',
        control: 'text',
      },
    },
  ],
  show_price: {
    name: 'show_price',
    description: '',
    control: 'boolean',
  },
  show_cta: {
    name: 'show_cta',
    description: '',
    control: 'boolean',
  },
};

export const ProductInfoArgs = {
  data_source: 'product_info_banner',
  description_style: [
    {
      text_level: 'h3',
      text_color: '#323433',
      font_family: 'Minerva Modern',
      desktop_font_size: '24',
      tablet_font_size: '24',
      mobile_font_size: '18',
    },
  ],
  button: [
    {
      text: 'Add To Cart',
      variant: 'solid',
      link: '',
      start_decorator: '',
      end_decorator: '',
      klaviyo_form_id: '',
      tracking_label: '',
      id: 'buyNow_pla_button',
    },
  ],
  show_price: true,
  show_cta: true,
};
