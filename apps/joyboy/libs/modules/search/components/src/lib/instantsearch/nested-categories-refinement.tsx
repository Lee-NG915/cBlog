import { useRefinementList } from 'react-instantsearch';
import { useState, useMemo, useCallback } from 'react';
import { Box, Grid } from '@castlery/fortress';
import { Panel, PanelGroup } from './panel';
import { transformCategoryLabel, transformCategoryLabelWithData } from '../config/facet-display.config';
import { useCategoriesData } from '../config/search-context';
import { FilterList, FilterListItem } from './filter-list';

/**
 * ===== 类型定义 =====
 * 定义组件中使用的所有TypeScript接口和类型
 */

/**
 * Algolia搜索返回的原始refinement项目接口
 * 包含搜索facet的基本信息：标签、值、计数和是否被选中
 */
interface AlgoliaRefinementItem {
  label: string; // 显示标签
  value: string; // 实际值，通常是分类路径如 "furniture/chairs"
  count: number; // 该分类下的商品数量
  isRefined: boolean; // 是否当前被选中/过滤
}

/**
 * 处理后的分类项目接口
 * 从AlgoliaRefinementItem转换而来，用于组件内部使用
 */
interface CategoryItem {
  value: string; // 分类值
  label: string; // 分类标签
  count: number; // 商品数量
  isRefined: boolean; // 是否被选中
}

/**
 * 分类层级结构接口
 * 将扁平的分类数据组织成层级结构
 */
interface CategoriesHierarchy {
  topLevelCategories: CategoryItem[]; // 顶级分类数组
  subCategoriesMap: Record<string, CategoryItem[]>; // 子分类映射，key为父分类值
}

/**
 * 嵌套分类筛选组件的属性接口
 */
interface NestedCategoriesRefinementProps {
  categoryFacetFilter?: string[]; // 可选：要显示的特定分类permalink列表，用于限制显示范围
  attribute: string; // Algolia搜索属性名
  header: string; // 组件标题
}

/**
 * 子分类列表组件的属性接口
 */
interface SubcategoriesListProps {
  categories: CategoryItem[]; // 子分类数组
  parentItem: CategoryItem; // 父分类项目
  onRefine: (value: string) => void; // 点击时的回调函数
  singleTopLevelCategory?: boolean; // 是否只有一个顶级分类
}

/**
 * ===== 可重用组件 =====
 * 定义在组件内部使用的小型可重用组件
 */

/**
 * 子分类列表组件
 * 渲染某个父分类下的所有子分类，包含"All [父分类]"选项
 */
const SubcategoriesList = ({ categories, parentItem, onRefine, singleTopLevelCategory }: SubcategoriesListProps) => {
  // 构建完整的筛选项列表
  const filterItems: FilterListItem[] = [];

  // 如果不是单个顶级分类，添加"All [父分类]"选项
  if (!singleTopLevelCategory) {
    filterItems.push({
      value: parentItem.value,
      label: parentItem.label,
      isChecked: parentItem.isRefined,
    });
  }

  // 添加所有子分类
  categories.forEach((subItem) => {
    filterItems.push({
      value: subItem.value,
      label: subItem.label,
      isChecked: subItem.isRefined,
    });
  });

  return <FilterList items={filterItems} onItemToggle={onRefine} ariaLabel="Category filters" role="group" />;
};

/**
 * ===== 数据处理工具函数 =====
 * 将数据处理逻辑分离，提高可测试性和可维护性
 */

/**
 * 标准化permalink的工具函数
 * 移除前导斜杠、转换为小写、过滤掉不需要的子分类
 */
const normalizePermalinks = (permalinks: string[]): Set<string> => {
  if (!permalinks || permalinks.length === 0) {
    return new Set<string>();
  }

  return new Set(
    permalinks
      .map((p) => (p.startsWith('/') ? p.substring(1) : p).toLowerCase())
      .filter((permalink) => {
        const parts = permalink.split('/');
        // 如果只有一级分类，保留
        if (parts.length === 1) return true;
        // 如果第二级以'all-'开头，过滤掉
        if (parts.length >= 2 && parts[1].startsWith('all-')) return false;
        return true;
      })
  );
};

/**
 * 检查分类是否在允许的范围内
 */
const isCategoryAllowed = (categoryValue: string, allowedSet: Set<string>): boolean => {
  if (allowedSet.size === 0) return false;

  const parts = categoryValue.split('/');
  const baseCategory = parts[0]?.toLowerCase(); // 基础分类（顶级）
  const fullCategoryPath = categoryValue.toLowerCase(); // 完整分类路径

  return allowedSet.has(baseCategory) || allowedSet.has(fullCategoryPath);
};

/**
 * 将扁平分类数据组织成层级结构
 */
const organizeCategoriesHierarchy = (items: CategoryItem[]): CategoriesHierarchy => {
  const topLevelCategories: CategoryItem[] = [];
  const subCategoriesMap: Record<string, CategoryItem[]> = {};

  items.forEach((item) => {
    const parts = item.value.split('/');
    if (parts.length === 1) {
      // 单层路径 = 顶级分类
      topLevelCategories.push(item);
    } else if (parts.length > 1) {
      // 跳过以'all-'开头的子分类
      if (parts[1].startsWith('all-')) {
        return;
      }
      // 多层路径 = 子分类，按父分类分组
      const parentKey = parts[0]; // 父分类键
      if (!subCategoriesMap[parentKey]) {
        subCategoriesMap[parentKey] = [];
      }
      subCategoriesMap[parentKey].push(item);
    }
  });

  return { topLevelCategories, subCategoriesMap };
};

/**
 * ===== 自定义Hook：分类数据处理 =====
 * 简化后的Hook，职责更清晰
 */

/**
 * 处理分类数据的自定义Hook
 * 1. 从Algolia获取数据
 * 2. 根据categoryFacetFilter过滤
 * 3. 转换标签格式
 * 4. 组织成层级结构
 */
const useProcessedCategories = (categoryFacetFilter: string[] | undefined, attribute: string) => {
  const categoriesData = useCategoriesData();

  // 标准化和缓存分类过滤器
  const categoryFilterSet = useMemo(() => {
    return normalizePermalinks(categoryFacetFilter || []);
  }, [categoryFacetFilter]);

  // 项目转换函数：过滤 + 标签转换
  const transformItems = useCallback<(items: AlgoliaRefinementItem[]) => AlgoliaRefinementItem[]>(
    (items) => {
      // 如果没有设置过滤器，返回所有项目（默认行为：显示所有分类）
      if (categoryFilterSet.size === 0) {
        return items.map((item) => ({
          ...item,
          label: transformCategoryLabelWithData(item.value, categoriesData),
        }));
      }

      // 有过滤器时，只显示允许的分类
      return items
        .filter((item) => isCategoryAllowed(item.value, categoryFilterSet))
        .map((item) => ({
          ...item,
          label: transformCategoryLabelWithData(item.value, categoriesData),
        }));
    },
    [categoryFilterSet, categoriesData]
  );

  // 获取Algolia数据
  const { items, refine } = useRefinementList({
    attribute,
    limit: 999,
    transformItems,
  });

  // 组织层级结构
  const categoriesHierarchy = useMemo(() => {
    return organizeCategoriesHierarchy(items);
  }, [items]);

  return { categoriesHierarchy, refine };
};

/**
 * ===== 主组件：嵌套分类筛选 =====
 * 渲染分层的分类筛选界面，支持展开/折叠和多级分类选择
 */

/**
 * 嵌套分类筛选组件
 * 根据传入的分类数据渲染可交互的分类筛选界面
 * 支持单个顶级分类时的特殊显示逻辑
 */
export function NestedCategoriesRefinement({
  categoryFacetFilter,
  attribute,
  header,
}: NestedCategoriesRefinementProps) {
  // 处理分类数据
  const { categoriesHierarchy, refine } = useProcessedCategories(categoryFacetFilter, attribute);

  // 管理展开的分类状态（用于手风琴效果）
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // 提前检查：如果没有分类数据，不渲染任何内容
  // 这种情况通常发生在：
  // 1. categoryFacetFilter为空数组或undefined (collections页面)
  // 2. Algolia没有返回匹配的分类数据
  if (!categoriesHierarchy || categoriesHierarchy.topLevelCategories.length === 0) {
    return null;
  }

  /**
   * 检查是否只有一个顶级分类
   * 用于决定是否需要特殊的显示逻辑
   */
  const hasSingleTopLevelCategory = categoriesHierarchy.topLevelCategories.length === 1;

  /**
   * 处理手风琴展开/折叠状态变化
   */
  const handleAccordionChange = (category: string) => {
    setExpandedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  /**
   * 检查是否有可渲染的内容
   * 用于决定是否应该渲染整个Panel
   */
  const hasRenderableContent = () => {
    // 如果只有一个顶级分类
    if (hasSingleTopLevelCategory) {
      const singleTopCategory = categoriesHierarchy.topLevelCategories[0];
      const subCategories = categoriesHierarchy.subCategoriesMap[singleTopCategory.value] || [];

      // 有子分类或者顶级分类本身就算有内容
      return subCategories.length > 0 || singleTopCategory;
    }

    // 多个顶级分类时，检查是否有任何分类有子分类
    return categoriesHierarchy.topLevelCategories.some((topItem) => {
      const subCategories = categoriesHierarchy.subCategoriesMap[topItem.value] || [];
      return subCategories.length > 0;
    });
  };

  /**
   * 渲染默认分类视图
   * 显示所有顶级分类，每个分类可以展开显示其子分类
   * 特殊处理：如果只有一个顶级分类，直接显示其子分类而不显示顶级分类的header
   */
  const renderDefaultCategoryView = () => {
    // 如果只有一个顶级分类，直接显示其子分类
    if (hasSingleTopLevelCategory) {
      const singleTopCategory = categoriesHierarchy.topLevelCategories[0];
      const subCategories = categoriesHierarchy.subCategoriesMap[singleTopCategory.value] || [];

      // 如果有子分类，直接渲染子分类列表，不显示顶级分类的header
      if (subCategories.length > 0) {
        return (
          <SubcategoriesList
            categories={subCategories}
            parentItem={singleTopCategory}
            onRefine={refine}
            singleTopLevelCategory
          />
        );
      }

      // 如果没有子分类，显示顶级分类本身
      const singleCategoryItems: FilterListItem[] = [
        {
          value: singleTopCategory.value,
          label: singleTopCategory.label,
          isChecked: singleTopCategory.isRefined,
        },
      ];

      return <FilterList items={singleCategoryItems} onItemToggle={refine} ariaLabel="Category filters" role="group" />;
    }

    // 多个顶级分类的正常显示逻辑
    return (
      <Box>
        {categoriesHierarchy.topLevelCategories.map((topItem) => {
          const subCategories = categoriesHierarchy.subCategoriesMap[topItem.value] || [];
          const isExpanded = expandedCategories.includes(topItem.value);

          return (
            <Box key={topItem.value} sx={{ p: 0, display: 'block' }}>
              <Panel
                header={transformCategoryLabel(topItem.value, true)}
                expanded={isExpanded}
                showIf={subCategories.length > 0}
                divider={false}
                level="subh2"
                sx={{
                  pr: 3,
                }}
              >
                <SubcategoriesList categories={subCategories} parentItem={topItem} onRefine={refine} />
              </Panel>
            </Box>
          );
        })}
      </Box>
    );
  };

  /**
   * 组件最终渲染逻辑
   * 只有当有可渲染的内容时才渲染Panel
   */
  if (!hasRenderableContent()) {
    return null;
  }

  return (
    <Panel header={header} expanded={true}>
      <PanelGroup>{renderDefaultCategoryView()}</PanelGroup>
    </Panel>
  );
}
