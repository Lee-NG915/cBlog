'use client';
import { useEffect, useRef } from 'react';
import { useInstantSearch, useSearchBox } from 'react-instantsearch';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_SEARCH_RESULTS_LOADED } from '@castlery/modules-tracking-services';

/**
 * SearchResultsLoadedTracking - 跟踪搜索结果加载事件
 *
 * 当搜索结果加载完成时触发埋点，记录：
 * - 搜索关键词 (searchTerm)
 * - 搜索结果数量 (resultCount)
 *
 * 触发时机：
 * - 搜索结果加载完成（status === 'idle' 且 !results.__isArtificial）
 * - 每次查询词改变时触发一次新的埋点
 */
export function SearchResultsLoadedTracking() {
  const { results, status } = useInstantSearch();
  const { query } = useSearchBox();
  const dispatch = useAppDispatch();
  const trackedQueriesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 当搜索完成且结果不是人工生成的时候触发埋点
    const isSearchComplete = status === 'idle' && !results.__isArtificial;
    const currentQuery = query || '';
    const hasTrackedThisQuery = trackedQueriesRef.current.has(currentQuery);

    // 只在搜索完成且该查询词尚未跟踪过时触发埋点
    if (isSearchComplete && !hasTrackedThisQuery) {
      const resultCount = results.nbHits || 0;

      dispatch(
        EVENT_SEARCH_RESULTS_LOADED({
          searchTerm: currentQuery,
          suggestionCount: resultCount,
        })
      );

      // 标记该查询词已跟踪
      trackedQueriesRef.current.add(currentQuery);
    }
  }, [results, status, query, dispatch]);

  return null;
}
