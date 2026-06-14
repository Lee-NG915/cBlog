import type { Meta, StoryObj } from '@storybook/react';
import { WishlistBtn } from './wishlist-btn';
import { Box, Typography, Card, CardContent } from '@castlery/fortress';

const meta: Meta<typeof WishlistBtn> = {
  title: 'Shared/Components/WishlistBtn',
  component: WishlistBtn,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '收藏按钮组件，支持添加/移除收藏功能，内置 Toast 通知和 Redux 状态管理。',
      },
    },
  },
  argTypes: {
    variantId: {
      description: '产品变体 ID',
      control: { type: 'number' },
    },
    anchorOrigin: {
      description: 'Toast 显示位置',
      control: { type: 'object' },
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          p: 4,
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WishlistBtn>;

// 基础收藏按钮
export const Default: Story = {
  args: {
    variantId: 438721,
  },
  parameters: {
    docs: {
      description: {
        story: '基础收藏按钮，使用默认的 Toast 显示位置。',
      },
    },
  },
};

// 自定义 Toast 位置 - 底部右侧
export const BottomRight: Story = {
  args: {
    variantId: 438722,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'right',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast 显示在底部右侧，适合产品列表页面。',
      },
    },
  },
};

// 自定义 Toast 位置 - 顶部中央
export const TopCenter: Story = {
  args: {
    variantId: 438723,
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast 显示在顶部中央。',
      },
    },
  },
};

// 自定义 Toast 位置 - 底部中央
export const BottomCenter: Story = {
  args: {
    variantId: 501234,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast 显示在底部中央，适合移动端。',
      },
    },
  },
};

// 无 variantId（禁用状态）
export const Disabled: Story = {
  args: {
    variantId: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: '没有 variantId 时按钮处于禁用状态。',
      },
    },
  },
};

// Wishlist 添加前状态（未收藏）
export const BeforeAddToWishlist: Story = {
  args: {
    variantId: 438721,
  },
  parameters: {
    docs: {
      description: {
        story:
          '产品未添加到 wishlist 时的状态，收藏按钮显示为未选中。点击后将添加到 wishlist 并显示"Added to wishlist!"的 Toast。',
      },
    },
    // 模拟空的 wishlist 状态
    mockData: [
      {
        url: '/api/wishlist',
        method: 'GET',
        status: 200,
        response: [],
      },
    ],
  },
};

// Wishlist 添加后状态（已收藏）
export const AfterAddToWishlist: Story = {
  args: {
    variantId: 438721,
  },
  parameters: {
    docs: {
      description: {
        story:
          '产品已添加到 wishlist 时的状态，收藏按钮显示为已选中。点击后将从 wishlist 移除并显示"Removed from wishlist!"的 Toast。',
      },
    },
    // 模拟包含当前产品的 wishlist 状态
    mockData: [
      {
        url: '/api/wishlist',
        method: 'GET',
        status: 200,
        response: [
          {
            id: 438721,
            name: 'Vincent Dining Chair - Black/Fabric',
            price: '179.00',
            image:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/products/vincent-dining-chair/vincent-dining-chair-black-fabric-1',
          },
        ],
      },
    ],
  },
};

// 在产品卡片场景中的使用示例
export const InProductCard: Story = {
  render: (args) => (
    <Card
      sx={{
        width: 300,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          aspectRatio: '1',
          backgroundColor: 'grey.100',
          position: 'relative',
          backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
          }}
        >
          <WishlistBtn {...args} />
        </Box>
      </Box>
      <CardContent>
        <Typography level="h4">Arden Dining Chair</Typography>
        <Typography level="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Elegant dining chair crafted from premium oak wood
        </Typography>
        <Typography level="h3" sx={{ mt: 2 }}>
          $299.00
        </Typography>
      </CardContent>
    </Card>
  ),
  args: {
    variantId: 1005,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'right',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '在产品卡片中的使用示例，收藏按钮位于图片右上角。',
      },
    },
  },
};

// 多个收藏按钮对比
export const MultipleButtons: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography level="body2" sx={{ mb: 2 }}>
          默认位置
        </Typography>
        <WishlistBtn variantId={2001} />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography level="body2" sx={{ mb: 2 }}>
          底部右侧
        </Typography>
        <WishlistBtn
          variantId={2002}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography level="body2" sx={{ mb: 2 }}>
          顶部中央
        </Typography>
        <WishlistBtn
          variantId={2003}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography level="body2" sx={{ mb: 2 }}>
          底部中央
        </Typography>
        <WishlistBtn
          variantId={2004}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        />
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: '展示不同 Toast 位置的收藏按钮对比。',
      },
    },
  },
};

// 网格布局中的使用示例
export const InGridLayout: Story = {
  render: () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 3,
        maxWidth: 800,
      }}
    >
      {[1, 2, 3, 4].map((id) => (
        <Card key={id} sx={{ position: 'relative' }}>
          <Box
            sx={{
              aspectRatio: '1',
              backgroundColor: 'grey.100',
              position: 'relative',
              backgroundImage: `url(https://images.unsplash.com/photo-${
                id === 1
                  ? '1586023492125-27b2c045efd7'
                  : id === 2
                  ? '1506439773649-6e0eb8cfb237'
                  : id === 3
                  ? '1549497538-303791108f95'
                  : '1555041469-a586c61ea9bc'
              }?w=400&h=400&fit=crop)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 2,
              }}
            >
              <WishlistBtn
                variantId={3000 + id}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              />
            </Box>
          </Box>
          <CardContent sx={{ p: 2 }}>
            <Typography level="body1">Product {id}</Typography>
            <Typography level="h4">${299 + id * 50}.00</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: '在网格布局中的多个产品卡片中使用收藏按钮。',
      },
    },
  },
};
