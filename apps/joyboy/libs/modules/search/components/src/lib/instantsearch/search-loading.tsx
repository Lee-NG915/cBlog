'use client';

import { useEffect, useRef } from 'react';
import { useInstantSearch } from 'react-instantsearch';
import { Box, CircularProgress } from '@castlery/fortress';

/**
 * 搜索 Loading 状态管理
 * - 只在 stalled 状态时显示（Algolia 最佳实践）
 * - 首次渲染时不显示，避免 SSR 已有数据时出现不必要的 loading
 * https://www.algolia.com/doc/guides/building-search-ui/ui-and-ux-patterns/loading-indicator/react#page-title
 */
export function SearchLoading() {
  const { status } = useInstantSearch();

  if (status === 'stalled') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(251, 249, 244, 0.9)', // warmLinen-200 with high opacity
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'opacity 300ms',
        }}
      >
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return null;
}
