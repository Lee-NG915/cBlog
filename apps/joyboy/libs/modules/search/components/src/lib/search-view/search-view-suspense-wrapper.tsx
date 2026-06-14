import { Suspense } from 'react';
import { SearchViewServerWrapper, type SearchViewServerWrapperProps } from './search-view-server-wrapper';
import { SearchLoadingSkeleton } from '../loading';
import React from 'react';

/**
 * SearchViewServerWrapper 的 Suspense 包装器
 *
 * 根据 Next.js 官方文档，在服务器组件中使用 Suspense 是完全支持的。
 * 这允许在异步操作（如数据获取）进行时显示回退 UI，实现流式渲染和部分渲染。
 *
 * 官方参考：
 * https://nextjs.net.cn/docs/app/building-your-application/routing/loading-ui-and-streaming
 *
 * 使用示例：在模板组件中使用此包装器，可以实现细粒度的 loading 控制，
 * 让页面其他部分（面包屑、Banner、SEO等）立即显示，只有搜索结果区域显示 loading。
 */

type SearchViewSuspenseWrapperProps = SearchViewServerWrapperProps & {
  /**
   * 是否在 loading 骨架屏中显示面包屑
   * @default false - 因为通常模板已经渲染了面包屑
   */
  showBreadcrumbsInSkeleton?: boolean;
  /**
   * 是否在 loading 骨架屏中显示横幅
   * @default false - 因为通常模板已经渲染了横幅
   */
  showBannerInSkeleton?: boolean;
};

export function SearchViewSuspenseWrapper({
  showBreadcrumbsInSkeleton = false,
  showBannerInSkeleton = false,
  ...searchViewProps
}: SearchViewSuspenseWrapperProps) {
  return (
    <Suspense
      fallback={<SearchLoadingSkeleton showBreadcrumbs={showBreadcrumbsInSkeleton} showBanner={showBannerInSkeleton} />}
    >
      <SearchViewServerWrapper {...searchViewProps} />
    </Suspense>
  );
}
