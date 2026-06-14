import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SortBy, type SortOption } from './sort-by';

const meta: Meta<typeof SortBy> = {
  title: 'Components/SortBy',
  component: SortBy,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A responsive sort dropdown component that adapts its behavior for mobile and desktop views.

## Features
- **Responsive Design**: Different layouts for mobile and desktop
- **Accessible**: Full keyboard navigation and screen reader support
- **Customizable**: Flexible props for labels, styling, and behavior
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Multiple Variants**: Supports different dropdown styles (sort, form, borderplain)

## Usage
\`\`\`tsx
import { SortBy } from '@castlery/shared-components';

const options = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

<SortBy
  value="relevance"
  options={options}
  onChange={(value) => console.log('Sort changed:', value)}
  dropdownProps={{ variant: 'sort' }}
/>
\`\`\`

## Dropdown Variants
- **sort**: Optimized for sorting interfaces with minimal styling
- **form**: Standard form dropdown with full styling
- **borderplain**: Plain border style for subtle appearance
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current selected sort value',
      control: 'select',
      options: ['relevance', 'price_asc', 'price_desc', 'newest', 'rating', 'popularity'],
    },
    options: {
      description: 'Available sort options',
      control: 'object',
    },
    onChange: {
      description: 'Callback when sort value changes',
      action: 'changed',
    },
    label: {
      description: 'Custom label (defaults to "Sort By")',
      control: 'text',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
    sx: {
      description: 'Additional styles',
      control: 'object',
    },
    dropdownProps: {
      description: 'Props passed to the Dropdown component',
      control: 'object',
    },
    labelProps: {
      description: 'Props passed to the Typography component',
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common sort options for reuse across stories
const defaultOptions: SortOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
];

const productOptions: SortOption[] = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'popularity', label: 'Most Popular' },
];

const articleOptions: SortOption[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Latest Articles' },
  { value: 'oldest', label: 'Oldest Articles' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
];

/**
 * Default story with sort variant (recommended for sorting interfaces)
 */
export const Default: Story = {
  args: {
    value: 'relevance',
    options: defaultOptions,
    onChange: (value) => console.log('Sort changed to:', value),
    dropdownProps: {
      variant: 'borderplain',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Default sort variant - optimized for sorting interfaces with minimal styling and clean appearance.',
      },
    },
  },
};

/**
 * Form variant - standard form dropdown styling
 */
export const FormVariant: Story = {
  args: {
    value: 'relevance',
    options: defaultOptions,
    onChange: (value) => console.log('Sort changed to:', value),
    dropdownProps: {
      variant: 'form',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form variant - standard form dropdown with full styling, borders, and background.',
      },
    },
  },
};

/**
 * Borderplain variant - subtle border styling
 */
export const BorderplainVariant: Story = {
  args: {
    value: 'relevance',
    options: defaultOptions,
    onChange: (value) => console.log('Sort changed to:', value),
    dropdownProps: {
      variant: 'borderplain',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Borderplain variant - plain border style for subtle appearance without background.',
      },
    },
  },
};

/**
 * Interactive story that demonstrates state management
 */
const InteractiveComponent = () => {
  const [value, setValue] = useState('relevance');

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '300px' }}>
      <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
        Current selection: <strong>{value}</strong>
      </p>
      <SortBy value={value} options={defaultOptions} onChange={setValue} dropdownProps={{ variant: 'borderplain' }} />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing state management. The current selection is displayed above the component.',
      },
    },
  },
};

/**
 * Product-specific sorting with different variants comparison
 */
const VariantComparisonComponent = () => {
  const [value1, setValue1] = useState('relevance');
  const [value2, setValue2] = useState('relevance');
  const [value3, setValue3] = useState('relevance');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '400px' }}>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Sort Variant (Recommended)</h4>
        <SortBy
          value={value1}
          options={productOptions}
          onChange={setValue1}
          dropdownProps={{ variant: 'borderplain' }}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '8px' }}>Form Variant</h4>
        <SortBy value={value2} options={productOptions} onChange={setValue2} dropdownProps={{ variant: 'form' }} />
      </div>

      <div>
        <h4 style={{ marginBottom: '8px' }}>Borderplain Variant</h4>
        <SortBy
          value={value3}
          options={productOptions}
          onChange={setValue3}
          dropdownProps={{ variant: 'borderplain' }}
        />
      </div>
    </div>
  );
};

export const VariantComparison: Story = {
  render: () => <VariantComparisonComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison of all three dropdown variants to help choose the right style for your use case.',
      },
    },
  },
};

/**
 * Custom styling with different variants
 */
export const CustomStyling: Story = {
  args: {
    value: 'relevance',
    options: defaultOptions,
    onChange: (value) => console.log('Sort changed to:', value),
    sx: {
      backgroundColor: '#f5f5f5',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
    },
    dropdownProps: {
      variant: 'form',
      size: 'sm',
      color: 'primary',
    },
    labelProps: {
      sx: { color: '#1976d2', fontWeight: 500 },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with custom styling including background, padding, and custom dropdown properties.',
      },
    },
  },
};

/**
 * Different sizes demonstration
 */
const SizeComparisonComponent = () => {
  const [value1, setValue1] = useState('relevance');
  const [value2, setValue2] = useState('relevance');
  const [value3, setValue3] = useState('relevance');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '300px' }}>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Small Size</h4>
        <SortBy
          value={value1}
          options={defaultOptions}
          onChange={setValue1}
          dropdownProps={{ variant: 'borderplain', size: 'sm' }}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '8px' }}>Medium Size</h4>
        <SortBy
          value={value2}
          options={defaultOptions}
          onChange={setValue2}
          dropdownProps={{ variant: 'borderplain', size: 'md' }}
        />
      </div>

      <div>
        <h4 style={{ marginBottom: '8px' }}>Large Size</h4>
        <SortBy
          value={value3}
          options={defaultOptions}
          onChange={setValue3}
          dropdownProps={{ variant: 'borderplain', size: 'lg' }}
        />
      </div>
    </div>
  );
};

export const SizeComparison: Story = {
  render: () => <SizeComparisonComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different dropdown sizes (sm, md, lg) to help choose the right size for your layout.',
      },
    },
  },
};

/**
 * Disabled state example
 */
export const Disabled: Story = {
  args: {
    value: 'relevance',
    options: defaultOptions,
    onChange: (value) => console.log('Sort changed to:', value),
    dropdownProps: {
      variant: 'borderplain',
      disabled: true,
    },
    labelProps: {
      sx: { opacity: 0.5 },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state example showing how the component appears when sorting is not available.',
      },
    },
  },
};

/**
 * Mobile view demonstration
 */
export const MobileView: Story = {
  args: {
    value: 'relevance',
    options: defaultOptions,
    onChange: (value) => console.log('Sort changed to:', value),
    label: 'Sort',
    dropdownProps: { variant: 'borderplain' },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view showing the simplified layout with only the label text visible and clickable.',
      },
    },
  },
};

/**
 * Desktop view demonstration
 */
export const DesktopView: Story = {
  args: {
    value: 'relevance',
    options: defaultOptions,
    onChange: (value) => console.log('Sort changed to:', value),
    label: 'Sort By',
    dropdownProps: { variant: 'borderplain' },
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'Desktop view showing the full layout with label and dropdown visible.',
      },
    },
  },
};

/**
 * Article/blog content sorting
 */
export const ArticleSort: Story = {
  args: {
    value: 'newest',
    options: articleOptions,
    onChange: (value) => console.log('Article sort changed to:', value),
    label: 'Sort Articles',
    dropdownProps: { variant: 'borderplain' },
  },
  parameters: {
    docs: {
      description: {
        story: 'Content/article sorting with borderplain variant for a more subtle appearance.',
      },
    },
  },
};

/**
 * Minimal options example
 */
export const MinimalOptions: Story = {
  args: {
    value: 'asc',
    options: [
      { value: 'asc', label: 'Ascending' },
      { value: 'desc', label: 'Descending' },
    ],
    onChange: (value) => console.log('Sort changed to:', value),
    label: 'Order',
    dropdownProps: { variant: 'borderplain' },
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal example with only two sort options using the sort variant.',
      },
    },
  },
};
