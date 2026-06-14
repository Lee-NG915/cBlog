import { Container, Box, Skeleton, Card, CardOverflow, CardContent, Grid, Stack } from '@castlery/fortress';

/**
 * 产品卡片骨架屏组件
 * 完全匹配 ProductCard 的真实结构，避免 skeleton → 真实内容切换时的 CLS
 *
 * 结构对齐：
 * - Card (variant="plain", height="100%")
 * - CardOverflow > Box (aspectRatio: 1) > 图片
 * - CardContent > 名称 > 描述 > 颜色选项 > 价格
 */
export function ProductCardSkeleton() {
  return (
    <Card
      variant="plain"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        gap: 0,
        borderRadius: 0,
        p: 0,
        m: 0,
        '--Card-padding': '0px',
        '--Card-radius': '0px',
      }}
    >
      {/* 产品图片 - 1:1 宽高比，匹配 ProductImage 组件 */}
      <CardOverflow>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
          }}
        >
          <Skeleton
            variant="overlay"
            sx={{
              position: 'absolute',
              inset: 0,
            }}
          >
            <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />
          </Skeleton>
        </Box>
      </CardOverflow>

      {/* 产品信息 - 匹配 ProductInfo 组件的 CardContent 结构 */}
      <CardContent
        sx={{
          flexGrow: 1,
          bgcolor: 'transparent',
          p: {
            xs: 2,
            md: 4,
          },
          pb: {
            xs: 4,
            md: 6,
          },
          pt: {
            xs: 3,
            md: 4,
          },
        }}
      >
        {/* 产品名称 - 匹配 Typography h5 */}
        <Skeleton
          variant="text"
          sx={{
            mb: {
              xs: 1,
              md: 2,
            },
            height: { xs: 20, md: 24 },
          }}
        />

        {/* 产品描述 - 匹配 Typography caption1 */}
        <Skeleton
          variant="text"
          width="70%"
          sx={{
            mb: {
              xs: 3,
              md: 4,
            },
            height: { xs: 14, md: 16 },
          }}
        />

        {/* 颜色选项 - 匹配 VariantOptionSelector 位置（在价格上方） */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            mb: {
              xs: 3,
              md: 4,
            },
          }}
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="circular" width={24} height={24} />
          ))}
        </Box>

        {/* 价格 - 匹配 Typography h5 */}
        <Skeleton variant="text" width="35%" sx={{ height: { xs: 20, md: 24 } }} />
      </CardContent>
    </Card>
  );
}

export interface SearchLoadingSkeletonProps {
  /**
   * 是否显示面包屑骨架屏
   * @default true
   */
  showBreadcrumbs?: boolean;
  /**
   * 是否显示横幅骨架屏
   * @default true
   */
  showBanner?: boolean;
  /**
   * 横幅高度配置
   * @default { xs: 146, md: 252 }
   */
  bannerHeight?: { xs: number; md: number };
  /**
   * 产品网格列数配置
   * @default { xs: 6, sm: 4, lg: 3 }
   */
  gridColumns?: { xs: number; sm?: number; lg: number };
  /**
   * 每页显示的产品数量（用于生成骨架屏数量）
   * @default 12
   */
  productsPerPage?: number;
}

/**
 * 搜索页面加载骨架屏
 * 完全匹配真实页面的布局和样式
 *
 * 适用于：
 * - Product Listing Page (PLP)
 * - Category Landing Page
 * - Search Results Page
 *
 * @example
 * ```tsx
 * // 基础用法
 * <SearchLoadingSkeleton />
 *
 * // 自定义配置
 * <SearchLoadingSkeleton
 *   showBanner={false}
 *   productsPerPage={24}
 * />
 * ```
 */
export function SearchLoadingSkeleton({
  showBreadcrumbs = true,
  showBanner = true,
  bannerHeight = { xs: 146, md: 252 },
  gridColumns = { xs: 6, sm: 4, lg: 3 },
  productsPerPage = 12,
}: SearchLoadingSkeletonProps = {}) {
  return (
    <Container
      disableGutters
      sx={{
        scrollBehavior: 'auto',
        '& *': {
          scrollBehavior: 'auto',
        },
      }}
    >
      {/* 面包屑 Skeleton */}
      {showBreadcrumbs && (
        <Container>
          <Box sx={{ py: { xs: 1.5, md: 2 } }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Skeleton variant="text" width={50} />
              <Skeleton variant="text" width={8} />
              <Skeleton variant="text" width={100} />
            </Stack>
          </Box>
        </Container>
      )}

      {/* 横幅图片 Skeleton */}
      {showBanner && (
        <Container disableGutters>
          <Card
            sx={{
              height: bannerHeight,
              border: 'none',
              boxShadow: 'none',
              '--Card-padding': 0,
            }}
          >
            <Skeleton
              variant="overlay"
              sx={{
                position: 'absolute',
                inset: 0,
              }}
            >
              <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />
            </Skeleton>
          </Card>
        </Container>
      )}

      {/* 搜索结果区域 */}
      <Container sx={{ mt: { xs: 3, md: 4 }, mb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* 左侧过滤器 Skeleton - 仅桌面端显示 */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 280,
              flexShrink: 0,
            }}
          >
            <Stack spacing={2.5}>
              {/* 过滤器标题 */}
              <Skeleton variant="text" width="40%" />

              {/* 过滤器选项组 */}
              {[1, 2, 3, 4].map((i) => (
                <Box key={i}>
                  <Skeleton variant="text" width="50%" sx={{ mb: 1 }} />
                  <Stack spacing={0.75}>
                    <Skeleton variant="rectangular" height={24} width="85%" sx={{ borderRadius: 'sm' }} />
                    <Skeleton variant="rectangular" height={24} width="70%" sx={{ borderRadius: 'sm' }} />
                    <Skeleton variant="rectangular" height={24} width="75%" sx={{ borderRadius: 'sm' }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* 右侧产品区域 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* 移动端过滤器和排序按钮 */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                gap: 2,
                mb: 3,
              }}
            >
              <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 'sm' }} />
              <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 'sm' }} />
            </Box>

            {/* 桌面端产品数量和排序 */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Skeleton variant="text" width={180} />
              <Skeleton variant="rectangular" width={220} height={40} sx={{ borderRadius: 'sm' }} />
            </Box>

            {/* 产品卡片网格 - 使用真实的Grid布局 */}
            <Grid container m={0} columnSpacing={4} rowSpacing={{ xs: 4, md: 6 }}>
              {Array.from({ length: productsPerPage }).map((_, index) => (
                <Grid key={index} {...gridColumns}>
                  <ProductCardSkeleton />
                </Grid>
              ))}
            </Grid>

            {/* 分页 Skeleton */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 6,
              }}
            >
              <Stack direction="row" spacing={1}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" width={40} height={40} sx={{ borderRadius: 'sm' }} />
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Container>
  );
}
