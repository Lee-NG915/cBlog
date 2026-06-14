import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { ProductFilter, ProductFilterProps, FilterItem } from './product-filter';
import React from 'react';
import { Box, Typography } from '@castlery/fortress';

const meta = {
  title: 'shared/ProductFilter',
  component: ProductFilter,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=13265-5811&t=acmX5ULr8vCnLoS4-4',
    },
  },
} as Meta<ProductFilterProps>;

export default meta;

type Story = StoryObj<ProductFilterProps>;

// 模拟数据 - 更符合实际使用场景
const mockFilterItems: FilterItem[] = [
  {
    id: 'category',
    label: 'Category',
    refinements: [
      { id: 'category-a', label: 'Category A' },
      { id: 'category-b', label: 'Category B' },
      { id: 'category-c', label: 'Category C' },
    ],
  },
  {
    id: 'color',
    label: 'Color',
    refinements: [
      { id: 'red', label: 'Red' },
      { id: 'blue', label: 'Blue' },
    ],
  },
  {
    id: 'price',
    label: 'Price',
    refinements: [{ id: 'under-100', label: 'Under $100' }],
  },
];

const desktopFilterItems: FilterItem[] = [
  {
    id: 'title',
    label: 'Title',
    refinements: [
      { id: 'category-a', label: 'Category A' },
      { id: 'category-b', label: 'Category B' },
      { id: 'category-c', label: 'Category C' },
      { id: 'category-d', label: 'Category D' },
      { id: 'category-e', label: 'Category E' },
      { id: 'category-f', label: 'Category F' },
      { id: 'category-g', label: 'Category G' },
    ],
  },
];

const mobileFilterItems: FilterItem[] = [
  {
    id: 'title',
    label: 'Title',
    refinements: [
      { id: 'category-a', label: 'Category A' },
      { id: 'category-b', label: 'Category B' },
      { id: 'category-c', label: 'Category C' },
      { id: 'category-d', label: 'Category D' },
      { id: 'category-e', label: 'Category E' },
      { id: 'category-f', label: 'Category F' },
      { id: 'category-g', label: 'Category G' },
    ],
  },
];

export const Default: Story = {
  args: {
    items: mockFilterItems,
    onRemoveRefinement: (refinement) => {
      console.log('Remove refinement:', refinement);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chips = await canvas.findAllByRole('button');
    expect(chips.length).toBeGreaterThan(0);
  },
};

export const FigmaDesktopExample: Story = {
  args: {
    items: desktopFilterItems,
    onRemoveRefinement: (refinement) => {
      console.log('Remove refinement:', refinement);
    },
  },
  render: (args) => (
    <Box>
      <Typography level="h4" sx={{ mb: 2 }}>
        Desktop
      </Typography>
      <Box sx={{ maxWidth: 1000 }}>
        <ProductFilter {...args} />
      </Box>
    </Box>
  ),
};

export const FigmaMobileExample: Story = {
  args: {
    items: mobileFilterItems,
    onRemoveRefinement: (refinement) => {
      console.log('Remove refinement:', refinement);
    },
  },
  render: (args) => (
    <Box>
      <Typography level="h4" sx={{ mb: 2 }}>
        Mobile
      </Typography>
      <Box sx={{ maxWidth: 400 }}>
        <ProductFilter {...args} />
      </Box>
    </Box>
  ),
};

export const Empty: Story = {
  args: {
    items: [],
    onRemoveRefinement: () => {},
  },
  render: (args) => (
    <Box>
      <Typography level="body2" sx={{ mb: 2 }}>
        When no filters are applied, the component returns null:
      </Typography>
      <ProductFilter {...args} />
      <Typography level="caption1" sx={{ mt: 2, fontStyle: 'italic' }}>
        (Nothing should render above this text)
      </Typography>
    </Box>
  ),
};

export const SingleFilter: Story = {
  args: {
    items: [
      {
        id: 'category',
        label: 'Category',
        refinements: [{ id: 'furniture', label: 'Furniture' }],
      },
    ],
    onRemoveRefinement: (refinement) => {
      console.log('Remove refinement:', refinement);
    },
  },
  render: (args) => (
    <Box>
      <Typography level="body2" sx={{ mb: 2 }}>
        Single filter with one refinement:
      </Typography>
      <ProductFilter {...args} />
    </Box>
  ),
};

// 创建一个独立的组件来处理状态
const InteractiveDemoComponent = () => {
  const [items, setItems] = React.useState<FilterItem[]>(mockFilterItems);

  const handleRemoveRefinement = (refinementToRemove: any) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => ({
          ...item,
          refinements: item.refinements.filter((refinement) => refinement.id !== refinementToRemove.id),
        }))
        .filter((item) => item.refinements.length > 0)
    );
  };

  const resetFilters = () => {
    setItems(mockFilterItems);
  };

  return (
    <Box>
      <Typography level="h4" sx={{ mb: 2 }}>
        Interactive Demo
      </Typography>
      <Typography level="body2" sx={{ mb: 2 }}>
        Click the × button on any filter chip to remove it:
      </Typography>
      <ProductFilter items={items} onRemoveRefinement={handleRemoveRefinement} sx={{ mb: 2 }} />
      <button
        onClick={resetFilters}
        style={{
          padding: '8px 16px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Reset Filters
      </button>
    </Box>
  );
};

export const InteractiveDemo: Story = {
  args: {},
  render: () => <InteractiveDemoComponent />,
};

export const ResponsiveComparison: Story = {
  args: {},
  render: () => (
    <Box>
      <Typography level="h4" sx={{ mb: 3 }}>
        Desktop vs Mobile Layout (Following Figma Design)
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography level="body1" sx={{ mb: 2, fontWeight: 'lg' }}>
          Desktop
        </Typography>
        <Box sx={{ maxWidth: 1000, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
          <ProductFilter items={desktopFilterItems} onRemoveRefinement={() => {}} />
        </Box>
      </Box>

      <Box>
        <Typography level="body1" sx={{ mb: 2, fontWeight: 'lg' }}>
          Mobile
        </Typography>
        <Box sx={{ maxWidth: 400, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
          <ProductFilter items={mobileFilterItems} onRemoveRefinement={() => {}} />
        </Box>
      </Box>
    </Box>
  ),
};
