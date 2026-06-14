'use client';
import React from 'react';
import { useCurrentRefinements, useSearchBox } from 'react-instantsearch';
import { ProductFilter, FilterItem } from '@castlery/shared-components';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import {
  useFacetHeader,
  transformFacetLabel,
  transformCategoryLabelWithData,
  transformNumericMenuRefinements,
  NUMERIC_MENU_CONFIGS,
} from '../config/facet-display.config';
import { FACET_ATTRIBUTE } from '../config/facet-attributes.config';
import { useCategoriesData, useLeadTimeItems } from '../config/search-context';
import type { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

export function CustomCurrentRefinements() {
  const { query: searchQuery, refine: refineSearch } = useSearchBox();
  const { items, refine } = useCurrentRefinements({
    excludedAttributes: [FACET_ATTRIBUTE.in_stock_regions, 'query'],
  });
  const { t } = useTranslation(LocalesNamespace.SHARED);
  const getFacetHeader = useFacetHeader();
  const categoriesData = useCategoriesData();
  const leadTimeItems = useLeadTimeItems();

  /**
   * 获取 leadtime items（已经在 getLeadTimeItemsData 中排序好了）
   */
  const getLeadTimeItems = (): NumericMenuConnectorParamsItem[] => {
    if (!leadTimeItems || leadTimeItems.length === 0) {
      // 回退到静态配置
      const staticConfig = NUMERIC_MENU_CONFIGS.find((config) => config.attribute === FACET_ATTRIBUTE.lead_time);
      return staticConfig ? staticConfig.getItems() : [];
    }

    // leadTimeItems 已经在 getLeadTimeItemsData 中排序好了，直接返回
    return leadTimeItems;
  };

  // 将react-instantsearch的数据格式转换为ProductFilter期望的格式
  const filterItems: FilterItem[] = [];

  // 添加搜索查询作为筛选条件（如果有的话）
  if (searchQuery && searchQuery.trim()) {
    filterItems.push({
      id: 'search-query',
      label: 'Search',
      refinements: [
        {
          id: 'search-query',
          label: searchQuery,
          value: { type: 'search', query: searchQuery }, // 特殊标记为搜索类型
        },
      ],
    });
  }

  // 添加其他facet筛选条件
  const facetFilterItems: FilterItem[] = items.map((item) => {
    // 特殊处理分类：每个分类refinement独立显示
    if (item.attribute === FACET_ATTRIBUTE.category) {
      return {
        id: [item.indexName, item.label].join('/'),
        label: getFacetHeader(item.label),
        refinements: item.refinements.map((refinement) => {
          const categoryValue = refinement.value as string;
          const label = transformCategoryLabelWithData(categoryValue, categoriesData) || categoryValue; // 如果转换失败，使用原始值

          return {
            id: refinement.label,
            label,
            value: refinement as any, // 保存单个refinement对象，使用 any 类型避免类型冲突
          };
        }),
      };
    }

    // 特殊处理 numericMenu 类型的 refinements
    const numericMenuConfig = NUMERIC_MENU_CONFIGS.find((config) => config.attribute === item.attribute);
    if (numericMenuConfig) {
      let transformedLabel: string | null = null;

      // 对于 leadtime filters，优先使用动态数据来获取正确的标签
      if (item.attribute === FACET_ATTRIBUTE.lead_time) {
        const leadTimeItemsList = getLeadTimeItems();
        transformedLabel = transformNumericMenuRefinements(item.refinements, leadTimeItemsList);
      }

      // 如果不是 leadtime 或者 leadtime 没有找到匹配的标签，使用通用的 transformFacetLabel
      if (!transformedLabel) {
        transformedLabel = transformFacetLabel(item.attribute, item.refinements, t);
      }

      if (transformedLabel) {
        return {
          id: [item.indexName, item.label].join('/'),
          label: getFacetHeader(item.label),
          refinements: [
            {
              id: item.refinements.map((r) => r.label).join('-'),
              label: transformedLabel,
              value: item.refinements as any, // 保存所有refinement对象，用于移除操作
            },
          ],
        };
      }
    }

    // 处理 range 类型的 refinements（如 slider）
    if (item.refinements.length === 2 && item.refinements.every((r) => r.type === 'numeric')) {
      const [minRefinement, maxRefinement] = item.refinements;
      const minLabel =
        transformFacetLabel(minRefinement.attribute, minRefinement.value, t) || minRefinement.value.toString();
      const maxLabel =
        transformFacetLabel(maxRefinement.attribute, maxRefinement.value, t) || maxRefinement.value.toString();

      return {
        id: [item.indexName, item.label].join('/'),
        label: getFacetHeader(item.label),
        refinements: [
          {
            id: `${minRefinement.label}-${maxRefinement.label}`,
            label: `${minLabel} - ${maxLabel}`,
            value: [minRefinement, maxRefinement] as any, // 保存两个refinement对象，使用 any 类型避免类型冲突
          },
        ],
      };
    }

    // 处理普通的 refinements
    return {
      id: [item.indexName, item.label].join('/'),
      label: getFacetHeader(item.label),
      refinements: item.refinements.map((refinement) => ({
        id: refinement.label,
        label: transformFacetLabel(refinement.attribute, refinement.value, t) || refinement.value.toString(), // 如果转换失败，使用原始值
        value: refinement as any, // 保存原始refinement对象用于后续操作，使用 any 类型避免类型冲突
      })),
    };
  });

  // 合并搜索查询和facet筛选条件
  filterItems.push(...facetFilterItems);

  // 处理移除筛选条件的逻辑
  const handleRemoveRefinement = (filterRefinement: any) => {
    // 处理搜索查询的移除
    if (filterRefinement.value && filterRefinement.value.type === 'search') {
      refineSearch('');
      return;
    }

    // 处理 numericMenu 和 range 类型的 refinements（包含多个refinement对象）
    if (Array.isArray(filterRefinement.value)) {
      // 移除所有refinement对象
      filterRefinement.value.forEach((refinement: any) => {
        refine(refinement);
      });
    } else {
      // 处理普通的 refinement（包括分类）
      refine(filterRefinement.value);
    }
  };

  return <ProductFilter items={filterItems} onRemoveRefinement={handleRemoveRefinement} />;
}
