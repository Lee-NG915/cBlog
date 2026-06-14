import { EcEnv } from '@castlery/config';
import {
  PdpSelectorConfigStoryblok,
  ProductCategoryGroupStoryblok,
  ProductLayoutGroupStoryblok,
  ProductSpuGroupStoryblok,
  ProductSpuStoryblok,
  PDPConfig,
  SpuGroup,
  LayoutGroup,
  CategoryGroup,
  SpuItem,
  SpuIndexEntry,
} from '@castlery/types';

/**
 * Merges subarrays of a two-dimensional array into an ordered one-dimensional array,
 * applying deduplication based on a key retrieved by the keyItem function.
 *
 * The merging order is column-wise: A1, B1, C1, A2, B2, C2, etc., where A, B, C
 * are subarrays and A1 is the 1st element of array A.
 *
 * Deduplication: If the key of an element is already present in the result set,
 * the function skips this element and checks the next element in the same subarray
 * until a distinct key is found or the subarray ends.
 *
 * @template T The type of elements in the subarrays.
 * @template K The type of the key used for deduplication.
 * @param {Array<Array<T>>} list - The list of subarrays to merge.
 * @param {function(T): K} keyItem - A function that returns the key for an element, used for deduplication.
 * @returns {Array<T>} The merged and deduplicated list of elements.
 */
export function mergeSort<T, K>(list: Array<Array<T>>, keyItem: (item: T) => K): Array<T> {
  // Use a Set to keep track of keys already added to the result for deduplication.
  const seenKeys = new Set<K>();
  const result: Array<T> = [];

  // Find the maximum length among all subarrays to determine the number of columns to process.
  const maxLength = Math.max(0, ...list.map((sublist) => sublist.length));

  // Iterate through each "column" (index i)
  for (let i = 0; i < maxLength; i++) {
    // Iterate through each subarray (list[j])
    for (let j = 0; j < list.length; j++) {
      const sublist = list[j];
      let currentElementIndex = i; // Start checking from the current column index

      // While loop to find the next element in the current sublist
      // whose key has not been seen yet.
      while (currentElementIndex < sublist.length) {
        const currentElement = sublist[currentElementIndex];
        const key = keyItem(currentElement);

        // If the key has not been seen, add the element to the result
        // and the key to the seenKeys set.
        if (!seenKeys.has(key)) {
          result.push(currentElement);
          seenKeys.add(key);
          break; // Found a valid element for this column in this sublist, move to the next sublist
        }

        // If the key has been seen, move to the next element in the same sublist.
        currentElementIndex++;
      }
      // If the while loop finishes without finding a valid element
      // (i.e., currentElementIndex >= sublist.length), it means all
      // remaining elements in this sublist from index i onwards have
      // keys that are already in the result. The loop for this sublist
      // for the current column (i) effectively ends.
    }
  }

  return result;
}

/**
 * 规范化 groupKey（从 attribute_tag 转换）
 */
export function normalizeGroupKey(tag: number | string | undefined): string {
  if (tag === null || tag === undefined) return 'default';
  const key = String(tag).toLowerCase().trim();
  return key || 'default';
}

/**
 * 生成产品链接
 */
export function generateProductLink(slug: string): string {
  const country = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase() || 'sg';
  return `/${country}/products/${slug}`;
}

/**
 * 构建索引 Map 和基础 UI Tree 结构（不依赖 currentSlug）
 * 这个函数只生成全局的映射和基础结构，不设置 isActive 和 isCurrent
 */
export function buildIndexMapAndBaseStructure(rawConfig: PdpSelectorConfigStoryblok | null): {
  indexMap: Record<string, SpuIndexEntry>;
  baseSpuGroups: SpuGroup[];
} {
  const indexMap: Record<string, SpuIndexEntry> = {};
  const spuGroups: SpuGroup[] = [];

  if (!rawConfig || !rawConfig.spu_groups || rawConfig.spu_groups.length === 0) {
    return { indexMap, baseSpuGroups: spuGroups };
  }

  // 全局跟踪：记录每个 slug 第一次出现的 spuGroupId（用于跨 spuGroup 去重）
  const seenSlugsBySpuGroup: Map<string, string> = new Map();

  // 遍历 SPU Groups（顶层分组，如某个产品系列）
  rawConfig.spu_groups.forEach((spuGroupBlok: ProductSpuGroupStoryblok) => {
    const spuGroupId = spuGroupBlok._uid;
    const spuGroupTitle = (spuGroupBlok.title || '').trim();
    const layoutGroups: LayoutGroup[] = [];
    let spuGroupDefaultLink = '';
    let spuGroupCategoryCount = 0; // 累计该 SPU Group 下所有 Layout Groups 的 Category Groups 总数

    // 当前 spuGroup 内已处理的 slug（用于同组内去重）
    const currentSpuGroupSeenSlugs: Set<string> = new Set();

    // 遍历 Layout Groups（形状，如 L-shape, U-shape, 3-Seater）
    spuGroupBlok.product_layouts?.forEach((layoutGroupBlok: ProductLayoutGroupStoryblok) => {
      const layoutGroupId = layoutGroupBlok._uid;
      const layoutGroupTitle = (layoutGroupBlok.title || '').trim();
      const categoryGroups: CategoryGroup[] = [];
      let layoutGroupDefaultLink = '';

      // 遍历 Category Groups（产品类别，如 Sofa, Sofa with Ottoman）
      layoutGroupBlok.product_categories?.forEach((categoryGroupBlok: ProductCategoryGroupStoryblok) => {
        const categoryGroupId = categoryGroupBlok._uid;
        const categoryGroupTitle = (categoryGroupBlok.title || '').trim();
        const products: SpuItem[] = [];

        // 遍历 SPUs（具体产品）
        categoryGroupBlok.products?.forEach((spu: ProductSpuStoryblok) => {
          const spuSlug = (spu.slug || '').trim();

          // 跳过空 slug
          if (!spuSlug) {
            return;
          }

          const firstSeenSpuGroupId = seenSlugsBySpuGroup.get(spuSlug);
          if (firstSeenSpuGroupId && firstSeenSpuGroupId !== spuGroupId) {
            return;
          }

          if (currentSpuGroupSeenSlugs.has(spuSlug)) {
            return;
          }

          if (!firstSeenSpuGroupId) {
            seenSlugsBySpuGroup.set(spuSlug, spuGroupId);
          }

          currentSpuGroupSeenSlugs.add(spuSlug);

          const spuName = spu.name || '';
          const groupKey = normalizeGroupKey(spu.attribute_tag);

          // 构建索引 Map
          indexMap[spuSlug] = {
            spuGroupId,
            spuGroupTitle,
            layoutGroupId,
            layoutGroupTitle,
            categoryGroupId,
            categoryGroupTitle,
            groupKey,
          };

          // 构建 SPU 项（不设置 isCurrent）
          products.push({
            slug: spuSlug,
            name: spuName,
            image: '', // 占位符，图片在渲染时懒加载
            isCurrent: false,
            attributeTag: groupKey,
          });

          // 设置默认链接（第一个 SPU）
          if (!layoutGroupDefaultLink && spuSlug) {
            layoutGroupDefaultLink = generateProductLink(spuSlug);
          }
        });

        if (products.length > 0) {
          // 以 groupKey 为材质分组，放在类别层
          const buckets = products.reduce<Record<string, SpuItem[]>>((acc, spu) => {
            const key = spu.attributeTag ?? 'default';
            if (!acc[key]) acc[key] = [];
            acc[key].push(spu);
            return acc;
          }, {});
          const catKeys = Object.keys(buckets).sort((a, b) => {
            if (a === 'fabric' && b !== 'fabric') return -1;
            if (b === 'fabric' && a !== 'fabric') return 1;
            if (a === 'leather' && b !== 'fabric' && b !== 'leather') return -1;
            if (b === 'leather' && a !== 'fabric' && a !== 'leather') return 1;
            return a.localeCompare(b);
          });
          const groupKeyBuckets = catKeys.map((key) => {
            const prods = buckets[key];
            return {
              groupKey: key,
              products: prods,
              defaultLink: prods[0] ? generateProductLink(prods[0].slug) : '',
            };
          });
          const showGroupOptions = catKeys.includes('fabric') && catKeys.includes('leather');

          categoryGroups.push({
            id: categoryGroupId,
            title: categoryGroupTitle,
            icon: categoryGroupBlok.icon?.filename,
            dimension: categoryGroupBlok?.dimension,
            groupKeys: catKeys,
            groupKeyBuckets,
            showGroupOptions,
            activeGroupKey: catKeys.length === 1 ? catKeys[0] : undefined,
            defaultLink: groupKeyBuckets[0]?.defaultLink,
            isActive: false,
          });
        }
      });

      if (categoryGroups.length > 0) {
        // 累计 Category Group 数量到 SPU Group 层级
        spuGroupCategoryCount += categoryGroups.length;

        layoutGroups.push({
          id: layoutGroupId,
          title: layoutGroupTitle,
          activeCategoryGroupId: undefined,
          defaultLink: layoutGroupDefaultLink || categoryGroups[0]?.defaultLink || '',
          categoryGroups,
          isActive: false,
        });

        // 设置 SPU Group 的默认链接（第一个 Layout Group 的第一个 Category Group 的第一个 SPU）
        if (!spuGroupDefaultLink && layoutGroupDefaultLink) {
          spuGroupDefaultLink = layoutGroupDefaultLink;
        }
      }
    });

    if (layoutGroups.length > 0) {
      spuGroups.push({
        id: spuGroupId,
        title: spuGroupTitle,
        defaultLink:
          spuGroupDefaultLink ||
          generateProductLink(layoutGroups[0]?.categoryGroups[0]?.groupKeyBuckets?.[0]?.products?.[0]?.slug || ''),
        layoutGroups,
        isActive: false,
        categoryCount: spuGroupCategoryCount,
      });
    }
  });

  return { indexMap, baseSpuGroups: spuGroups };
}

/**
 * 根据 currentSlug 标记 isActive/isCurrent 并过滤 UI Tree
 */
export function applyCurrentSlugToUiTree(
  indexMap: Record<string, SpuIndexEntry>,
  baseSpuGroups: SpuGroup[],
  currentSlug?: string
): SpuGroup[] | null {
  if (!currentSlug) {
    return baseSpuGroups.length > 0 ? baseSpuGroups : null;
  }

  const entry = indexMap[currentSlug];
  if (!entry) {
    return null;
  }

  const targetSpuGroup = baseSpuGroups.find((spuGroup) => spuGroup.id === entry.spuGroupId);
  if (!targetSpuGroup) {
    return null;
  }

  const processedLayoutGroups = targetSpuGroup.layoutGroups.map((layoutGroup) => {
    if (layoutGroup.id !== entry.layoutGroupId) {
      return layoutGroup;
    }

    let layoutGroupIsActive = false;
    let layoutGroupActiveCategoryGroupId: string | undefined;

    const categoryGroups = layoutGroup.categoryGroups.map((categoryGroup) => {
      let categoryGroupActiveKey: string | undefined;
      let categoryGroupIsActive = false;

      const groupKeyBuckets = categoryGroup.groupKeyBuckets?.map((bucket) => {
        const products = bucket.products.map((product) => {
          const isCurrent = product.slug === currentSlug;
          if (isCurrent) {
            categoryGroupIsActive = true;
            categoryGroupActiveKey = bucket.groupKey;
            layoutGroupIsActive = true;
            layoutGroupActiveCategoryGroupId = categoryGroup.id;
          }
          return { ...product, isCurrent };
        });
        return { ...bucket, products };
      });

      return {
        ...categoryGroup,
        groupKeyBuckets,
        activeGroupKey:
          categoryGroupActiveKey ?? (categoryGroup.groupKeys?.length === 1 ? categoryGroup.groupKeys[0] : undefined),
        isActive: categoryGroupIsActive,
      };
    });

    return {
      ...layoutGroup,
      categoryGroups,
      activeCategoryGroupId: layoutGroupActiveCategoryGroupId,
      isActive: layoutGroupIsActive,
    };
  });

  // 只筛选 spu group（只返回当前产品所在的 spu group）
  const processedSpuGroup: SpuGroup = {
    ...targetSpuGroup,
    layoutGroups: processedLayoutGroups,
    isActive: true,
  };

  return [processedSpuGroup];
}

/**
 * 转换配置：将 Storyblok 原始配置转换为倒排索引 Map 和 UI Tree
 * 保持向后兼容，内部使用新的分离函数
 */
export function transformPdpConfig(rawConfig: PdpSelectorConfigStoryblok | null, currentSlug?: string): PDPConfig {
  const { indexMap, baseSpuGroups } = buildIndexMapAndBaseStructure(rawConfig);
  const filteredSpuGroups = applyCurrentSlugToUiTree(indexMap, baseSpuGroups, currentSlug);

  return {
    indexMap,
    uiTree: { spuGroups: filteredSpuGroups },
    raw: rawConfig,
  };
}

/**
 * 根据 currentSlug 丰富配置数据（计算 isActive 和 isCurrent）
 * 注意：这个函数实际上在 transformPdpConfig 中已经处理了，这里保留作为备用
 */
export function enrichPdpConfigWithCurrentSlug(config: PDPConfig, currentSlug?: string): PDPConfig {
  if (!currentSlug) {
    // 如果没有 currentSlug，重置所有 isActive 和 isCurrent
    const resetConfig = { ...config };
    resetConfig.uiTree.spuGroups?.forEach((spuGroup) => {
      spuGroup.isActive = false;
      spuGroup.layoutGroups.forEach((layoutGroup) => {
        layoutGroup.isActive = false;
        layoutGroup.activeCategoryGroupId = undefined;
        layoutGroup.categoryGroups.forEach((categoryGroup) => {
          categoryGroup.activeGroupKey = undefined;
          categoryGroup.showGroupOptions = false;
          categoryGroup.isActive = false;
          categoryGroup.groupKeyBuckets?.forEach((bucket) => {
            bucket.products.forEach((product) => {
              product.isCurrent = false;
            });
          });
        });
      });
    });
    return resetConfig;
  }

  // 查找当前 SPU 的位置
  const entry = config.indexMap[currentSlug];
  if (!entry) {
    return config;
  }

  // 设置 isActive 和 isCurrent
  const updatedConfig = { ...config };
  updatedConfig.uiTree.spuGroups?.forEach((spuGroup) => {
    spuGroup.isActive = spuGroup.id === entry.spuGroupId;
    spuGroup.layoutGroups.forEach((layoutGroup) => {
      layoutGroup.isActive = layoutGroup.id === entry.layoutGroupId;
      layoutGroup.categoryGroups.forEach((categoryGroup) => {
        let catActive = false;
        categoryGroup.groupKeyBuckets?.forEach((bucket) => {
          bucket.products.forEach((product) => {
            const hit = product.slug === currentSlug;
            product.isCurrent = hit;
            if (hit) {
              catActive = true;
              categoryGroup.activeGroupKey = bucket.groupKey;
            }
          });
        });
        categoryGroup.isActive = catActive;
        if (!catActive) {
          categoryGroup.activeGroupKey = undefined;
        }
      });
      const activeCategory = layoutGroup.categoryGroups.find((c) => c.isActive);
      layoutGroup.activeCategoryGroupId = activeCategory?.id;
    });
  });

  return updatedConfig;
}
