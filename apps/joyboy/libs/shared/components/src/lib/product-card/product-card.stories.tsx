import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect, userEvent } from '@storybook/test';
import { ProductCard, ProductData } from './product-card';
import { Box, Container } from '@castlery/fortress';

// Mock data for the product
const mockProduct: ProductData = {
  name: 'Jonathan Sofa',
  slug: 'jonathan-sofa',
  product_type: 'configurable',
  colorVariantsLength: 3,
  lengthVariantsLength: 2,
  colorOptionLimit: 3,
  variants: [
    {
      id: '27480',
      sku: 'AS-000198-PT4001',
      name: 'Jonathan Sofa, Performance Creamy White',
      price: '1569.0',
      list_price: '1699.0',
      color: 'white',
      lead_time: 8,
      lead_time_presentation: 'Within Apr 10 - Apr 17',
      product_short_description: 'Modular, Low-Profile Design',
      available_quantity: 5,
      badges: ['SALE'],
      tags: ['bestsellers', 'modular_sofas'],
      images: [
        {
          large:
            'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4001/Jonathan-3-Seater-Sofa-Performance-Creamy-White-Front-1683801320.jpg',
        },
      ],
      life_style_image: {
        large:
          'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683802588/crusader/variants/T50440978-PT4001/Jonathan-Sofa-Performance-Creamy-White-Lifestyle-Crop-1683802585.jpg',
      },
      option_values: {
        material: {
          value: 'twill_creamy_white',
          presentation: 'Performance Creamy White',
          image_src:
            'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1683189280/crusader/variants/PT-4001/Jonathan-Side-Right-Chaise-Sofa-Creamy-White-Det_6-1683189277.jpg',
        },
      },
    },
    {
      id: '27481',
      sku: 'AS-000198-PT4002',
      name: 'Jonathan Sofa, Performance Navy Blue',
      price: '1569.0',
      list_price: '1699.0',
      color: 'blue',
      lead_time: 12,
      lead_time_presentation: 'Within Apr 17 - Apr 24',
      product_short_description: 'Modular, Low-Profile Design',
      available_quantity: 10,
      badges: ['SALE'],
      tags: ['bestsellers', 'modular_sofas'],
      images: [
        {
          large:
            'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4002/Jonathan-3-Seater-Sofa-Performance-Navy-Blue-Front-1683801320.jpg',
        },
      ],
      life_style_image: {
        large:
          'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683802588/crusader/variants/T50440978-PT4002/Jonathan-Sofa-Performance-Navy-Blue-Lifestyle-Crop-1683802585.jpg',
      },
      option_values: {
        material: {
          value: 'twill_navy_blue',
          presentation: 'Performance Navy Blue',
          image_src:
            'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1683189280/crusader/variants/PT-4002/Jonathan-Side-Right-Chaise-Sofa-Navy-Blue-Det_6-1683189277.jpg',
        },
      },
    },
    {
      id: '27482',
      sku: 'AS-000198-PT4003',
      name: 'Jonathan Sofa, Performance Charcoal Gray',
      price: '1569.0',
      color: 'gray',
      lead_time: 8,
      lead_time_presentation: 'Within Apr 10 - Apr 17',
      product_short_description: 'Modular, Low-Profile Design',
      available_quantity: 15,
      badges: ['SALE'],
      tags: ['bestsellers', 'modular_sofas'],
      images: [
        {
          large:
            'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1683801322/crusader/variants/T50440978-PT4003/Jonathan-3-Seater-Sofa-Performance-Charcoal-Gray-Front-1683801320.jpg',
        },
      ],
      option_values: {
        material: {
          value: 'twill_charcoal_gray',
          presentation: 'Performance Charcoal Gray',
          image_src:
            'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1683189280/crusader/variants/PT-4003/Jonathan-Side-Right-Chaise-Sofa-Charcoal-Gray-Det_6-1683189277.jpg',
        },
      },
    },
  ],
};

// Low stock variant
const mockLowStockProduct: ProductData = {
  ...mockProduct,
  variants: [
    {
      ...mockProduct.variants[0],
      available_quantity: 2,
      lead_time: 5,
    },
    ...mockProduct.variants.slice(1),
  ],
};

// Bundle product
const mockBundleProduct: ProductData = {
  ...mockProduct,
  name: 'Jonathan Living Room Set',
  product_type: 'bundle',
  variants: [
    {
      ...mockProduct.variants[0],
      price: '2999.0',
      list_price: '3299.0',
    },
  ],
};

// Single variant product
const mockSingleVariantProduct: ProductData = {
  ...mockProduct,
  variants: [mockProduct.variants[0]],
};

// Product without lifestyle image
const mockNoLifestyleProduct: ProductData = {
  ...mockProduct,
  variants: [
    {
      ...mockProduct.variants[0],
      life_style_image: undefined,
    },
    ...mockProduct.variants.slice(1),
  ],
};

const meta: Meta<typeof ProductCard> = {
  component: ProductCard,
  title: 'shared/ProductCard',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=12674-4622&m=dev',
    },
  },
  decorators: [
    (Story) => (
      <Container maxWidth="sm">
        <Box sx={{ maxWidth: 280, mx: 'auto' }}>
          <Story />
        </Box>
      </Container>
    ),
  ],
  argTypes: {
    onProductClick: { action: 'product clicked' },
    onVariantSelect: { action: 'variant selected' },
    onFavoriteClick: { action: 'favorite clicked' },
  },
};

export default meta;

type Story = StoryObj<typeof ProductCard>;

/**
 * Default product card showing all main features:
 * - Product image with hover to lifestyle image
 * - Product name and description
 * - Price with discount
 * - Variant selector with multiple color options
 * - Sale badge
 */
export const Default: Story = {
  args: {
    product: mockProduct,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if product name is displayed
    const productName = canvas.getByText('Jonathan Sofa');
    expect(productName).toBeInTheDocument();

    // Check if price is displayed
    const price = canvas.getByText(/1569\.0/);
    expect(price).toBeInTheDocument();

    // Check if original price (crossed out) is displayed
    const originalPrice = canvas.getByText(/1699\.0/);
    expect(originalPrice).toBeInTheDocument();

    // Check if product description is displayed
    const description = canvas.getByText(/Modular, Low-Profile Design/);
    expect(description).toBeInTheDocument();

    // Check if sale badge is displayed
    const badge = canvas.getByText('SALE');
    expect(badge).toBeInTheDocument();

    // Check if variant options are displayed
    const variantOptions = canvas.getAllByRole('button');
    const colorOptions = variantOptions.filter((button) => button.getAttribute('aria-label')?.includes('Select'));
    expect(colorOptions.length).toBeGreaterThan(0);
  },
};

/**
 * Product card in hover state showing:
 * - Lifestyle image
 * - Favorite button
 * - Lead time info
 */
export const HoverState: Story = {
  args: {
    product: mockProduct,
    forceHover: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if lead time info appears
    const leadTimeInfo = canvas.getByText(/Dispatch Within Apr 10 - Apr 17/);
    expect(leadTimeInfo).toBeInTheDocument();

    // Check if favorite button is visible
    const favoriteButton = canvas.getByLabelText(/favorite/i);
    expect(favoriteButton).toBeInTheDocument();
  },
};

/**
 * Product card with low stock warning
 */
export const LowStock: Story = {
  args: {
    product: mockLowStockProduct,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if low stock warning is displayed
    const stockWarning = canvas.getByText(/Only 2 left in stock/);
    expect(stockWarning).toBeInTheDocument();
  },
};

/**
 * Bundle product with "From" price prefix
 */
export const BundleProduct: Story = {
  args: {
    product: mockBundleProduct,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if "From" price is displayed for bundle
    const fromPrice = canvas.getByText(/From 2999\.0/);
    expect(fromPrice).toBeInTheDocument();
  },
};

/**
 * Product with single variant (no variant selector)
 */
export const SingleVariant: Story = {
  args: {
    product: mockSingleVariantProduct,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should not show variant selector for single variant
    const variantOptions = canvas.queryAllByRole('button');
    const colorOptions = variantOptions.filter((button) => button.getAttribute('aria-label')?.includes('Select'));
    expect(colorOptions.length).toBe(0);
  },
};

/**
 * Product with multiple sizes available
 */
export const MultipleSizes: Story = {
  args: {
    product: {
      ...mockProduct,
      lengthVariantsLength: 3,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check if size info is displayed
    const sizeInfo = canvas.getByText(/3 sizes available/);
    expect(sizeInfo).toBeInTheDocument();
  },
};

/**
 * Product without lifestyle image
 */
export const NoLifestyleImage: Story = {
  args: {
    product: mockNoLifestyleProduct,
  },
  render: (args) => <ProductCard {...args} />,
};

/**
 * Interactive example showing callbacks
 */
export const Interactive: Story = {
  args: {
    product: mockProduct,
    onProductClick: (product, variant) => {
      console.log('Product clicked:', product.name, variant.name);
    },
    onVariantSelect: (index) => {
      console.log('Variant selected:', index);
    },
    onFavoriteClick: (product, variant) => {
      console.log('Favorite clicked:', product.name, variant.name);
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test variant selection
    const variantButtons = canvas.getAllByRole('button');
    const colorOptions = variantButtons.filter((button) => button.getAttribute('aria-label')?.includes('Select'));

    if (colorOptions.length > 1) {
      await userEvent.click(colorOptions[1]);
      expect(args.onVariantSelect).toHaveBeenCalledWith(1);
    }
  },
};

/**
 * Grid layout showing multiple product cards
 */
export const GridLayout: Story = {
  render: () => (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
          p: 2,
        }}
      >
        <ProductCard product={mockProduct} />
        <ProductCard product={mockLowStockProduct} />
        <ProductCard product={mockBundleProduct} />
        <ProductCard product={mockSingleVariantProduct} />
        <ProductCard product={mockNoLifestyleProduct} />
        <ProductCard product={mockProduct} forceHover />
      </Box>
    </Container>
  ),
  decorators: [],
  parameters: {
    docs: {
      description: {
        story: 'This shows how product cards look in a grid layout, similar to a product listing page.',
      },
    },
  },
};
