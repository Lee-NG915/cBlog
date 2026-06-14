import React, { createContext, useContext, useMemo } from 'react';
import type { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

export interface CategoryData {
  permalink: string;
  name: string;
}

// 简化的筛选器排序数据类型，参考 Algolia FacetOrdering.values 的设计
// key: facet attribute name, value: 按优先级排序的值数组
export type FilterOrdersData = Record<string, string[]>;

interface SearchContextType {
  categoriesData?: CategoryData[];
  filterOrdersData?: FilterOrdersData;
  leadTimeItems?: NumericMenuConnectorParamsItem[]; // 新增：合并后的 leadtime filter items
  queryString?: string; // 新增：用于识别服务端配置的 queryString（如 quickship=true）
}

const SearchContext = createContext<SearchContextType>({});

export const SearchProvider: React.FC<{
  children: React.ReactNode;
  categoriesData?: CategoryData[];
  filterOrdersData?: FilterOrdersData;
  leadTimeItems?: NumericMenuConnectorParamsItem[];
  queryString?: string;
}> = ({ children, categoriesData, filterOrdersData, leadTimeItems, queryString }) => {
  // 使用 useMemo 优化 context value，避免不必要的重渲染
  const contextValue = useMemo(
    () => ({
      categoriesData,
      filterOrdersData,
      leadTimeItems,
      queryString,
    }),
    [categoriesData, filterOrdersData, leadTimeItems, queryString]
  );

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};

export const useCategoriesData = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useCategoriesData must be used within a SearchProvider');
  }
  return context.categoriesData;
};

export const useFilterOrdersData = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useFilterOrdersData must be used within a SearchProvider');
  }
  return context.filterOrdersData;
};

export const useLeadTimeItems = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useLeadTimeItems must be used within a SearchProvider');
  }
  return context.leadTimeItems;
};

export const useQueryString = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useQueryString must be used within a SearchProvider');
  }
  return context.queryString;
};
