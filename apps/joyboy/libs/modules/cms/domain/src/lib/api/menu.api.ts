import { EcEnv } from '@castlery/config';
import { CategoryItem } from '@castlery/types';
import { cache } from 'react';
import { logger } from '@castlery/observability';

// 添加筛选器排序相关的类型定义
export type FilterPropertyType = 'rug_size' | 'fabric_type' | 'fabric_feature';

export interface FilterValue {
  value: string;
  explanation: string | null;
}

export interface FilterOrderResponse {
  name: string;
  presentation: string;
  values: FilterValue[];
}

/**
 * 统一的分类数据获取函数
 * 复用相同的逻辑以保持一致性
 */
export async function fetchFromBackendApi<T>(endpoint: string): Promise<T> {
  const url = `${EcEnv.NEXT_PUBLIC_API_HOST}/${endpoint}`;
  try {
    const res = await fetch(url, {
      next: {
        tags: [`web-fetch-knight-${endpoint}`],
        revalidate: 3600,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as T;
    return data;
  } catch (error) {
    logger.error('Failed to fetch CMS data', { error, endpoint });
    throw error;
  }
}

/**
 * 将一级分类转换为自己 children 的第一个项目，带有 "All XXX" 名称
 *
 * 设计意图：
 * 1. 一级分类本身应该成为自己 children 数组的第一个项目
 * 2. 这个第一个项目拥有 nameWithAll 属性，显示为 "All XXX"
 * 3. 其余的子项目跟在后面
 *
 * 数据结构变化：
 * 原始：CategoryA(container) -> [SubCat1, SubCat2]
 * 处理后：CategoryA(container) -> [CategoryA(with nameWithAll="All CategoryA"), SubCat1, SubCat2]
 *
 * 最终使用时只需要取 item.children，因为真正的导航数据都在 children 数组中
 */
const addAllCategory = (data: CategoryItem[]) => {
  return data?.map((item) => {
    let { name } = item;

    // 只有当一级分类有 URL 时才进行处理（表示这是一个可访问的分类页面）
    if (item?.url?.trim()) {
      // 特殊情况：某些分类需要自定义显示名称
      if (item.permalink === 'chairs') {
        name = 'Chairs & Benches';
      } else if (item.permalink === 'beds') {
        name = 'Bedroom';
      }

      // 检查是否已经存在以 "All" 开头的子项，避免重复处理
      const hasAllItem = item?.children?.some((child) => child?.nameWithAll?.startsWith('All'));

      if (!hasAllItem) {
        const allCategoryName = `All ${name}`;

        // 核心操作：将一级分类作为 "All XXX" 项插入到自己的 children 开头
        // 这样一级分类就变成了自己 children 的第一个项目
        item?.children?.unshift({
          ...item,
          name,
          nameWithAll: allCategoryName,
          children: [], // 清空 children 避免无限嵌套
        });
        item.nameWithAll = allCategoryName;
      }
    }

    return {
      ...item,
      url: item?.url?.trim(),
    };
  });
};

export const fetchCategories = async () => {
  try {
    const data = await fetchFromBackendApi('taxonomies/menu');
    const { children } = data as { children: CategoryItem[] };
    return {
      data: addAllCategory(children),
    };
  } catch (error) {
    return {
      data: null,
      error: error,
    };
  }
};

export const fetchFlatCategories = cache(async () => {
  const menuItems = await fetchCategories();
  if (menuItems.error) {
    return null;
  }

  // 重要：这里使用 flatMap((item) => item.children) 而不是直接使用 menuItems.data
  // 原因：addAllCategory 函数已经将一级分类作为 "All XXX" 项添加到了每个一级分类的 children[0] 位置
  // 所以原始的一级分类现在实际上存在于 children 数组中，而顶层的 item 变成了容器
  // 通过只取 children，我们避免了数据重复，并且 children[0] 就是原来的一级分类（现在叫 "All XXX"）
  return flattenTaxonomies(menuItems.data?.flatMap((item) => item.children) || []);
});

export const fetchCollections = cache(async () => {
  try {
    const data = await fetchFromBackendApi('taxonomies/collections');
    const { children } = data as { children: CategoryItem[] };
    return {
      data: children,
    };
  } catch (error) {
    logger.error('Failed to fetch taxonomies/collections', { error });
    return {
      data: null,
      error: error,
    };
  }
});

export const fetchTaxonomies = cache(async () => {
  try {
    const [{ data: categories }, { data: collections }] = await Promise.all([fetchCategories(), fetchCollections()]);
    return {
      data: [...(categories || []), ...(collections || [])],
    };
  } catch (error) {
    logger.error('Failed to fetch taxonomies', { error });
    return {
      data: null,
      error: error,
    };
  }
});

export const fetchFlatTaxonomies = cache(async () => {
  const { data } = await fetchTaxonomies();
  if (!data) {
    return null;
  }
  return flattenTaxonomies(data);
});

export type FetchFlatCollectionsOptions = {
  permalink?: string;
};

export const fetchFlatCollections = async (options?: FetchFlatCollectionsOptions) => {
  const collections = await fetchCollections();
  if (collections.error) {
    return null;
  }
  const flat = flattenTaxonomies(collections.data || []);

  if (options?.permalink) {
    const item = flat.find((c) => c.permalink === options.permalink) || null;
    if (!item) return null;

    return [item];
  }

  return flat;
};

export function flattenTaxonomies(menu: CategoryItem[]): CategoryItem[] {
  const result = menu.reduce((acc, item) => {
    acc.push(item);
    if (item.children) {
      acc.push(...flattenTaxonomies(item.children));
    }
    return acc;
  }, [] as CategoryItem[]);

  return result;
}

export const getTaxonomiesItem = cache(async (permalink: string) => {
  const { data } = await fetchTaxonomies();
  if (!data) {
    return null;
  }
  const flat = flattenTaxonomies(data);
  // First try to find by permalink
  let menuItem = flat.find((item) => item.permalink === permalink) || null;

  // If not found by permalink, try to find by URL path
  if (!menuItem) {
    menuItem =
      flat.find((item) => {
        // Extract the slug from the URL (e.g., "/collections/rio-collection" -> "rio-collection")
        const urlSlug = item.url?.split('/').pop();
        return urlSlug === permalink;
      }) || null;
  }

  if (!menuItem) {
    return null;
  }

  return menuItem;
});

export async function getPermalinksFromMenu(): Promise<string[]> {
  const menuItems = await fetchFlatCategories();
  if (!menuItems) {
    return [];
  }
  // 去重
  return [...new Set(menuItems.map((item) => item.permalink))];
}

export async function getBreadcrumbsByPermalink(permalink: string) {
  const { data } = await fetchTaxonomies();
  if (!data) {
    return [];
  }
  const flatItems = flattenTaxonomies(data);
  const subPage = flatItems.find((item) => item.permalink === permalink);
  if (!subPage) {
    return [];
  }
  const result = [];
  if (subPage) {
    const parentPage = data.find((item) => item.children?.some((child) => child.permalink === permalink));
    if (parentPage) {
      result.unshift(parentPage);
    }
  }
  return result.map((item) => ({
    name: item.name,
    url: item.url,
  }));
}

export async function getFilterOrder({
  property,
}: {
  property: FilterPropertyType;
}): Promise<FilterOrderResponse | null> {
  const data = await fetchFromBackendApi<FilterOrderResponse>(`properties/${property}`);
  if (!data) {
    return null;
  }
  return data;
}
