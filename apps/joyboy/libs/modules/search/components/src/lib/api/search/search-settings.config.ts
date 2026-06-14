/**
 * Elasticsearch Search Settings Configuration
 *
 * 这个文件是搜索配置的单一数据源（Single Source of Truth）
 * 所有排序选项、索引名等配置都从这里读取，确保客户端和服务端配置一致
 */

/**
 * 排序配置
 * - key 格式: _<field>_<order>
 * - 客户端URL使用去掉下划线的格式: price_asc, price_desc, lead_asc, lead_desc
 */
export const SEARCH_SORTING_CONFIG = {
  default: [
    {
      field: '_score',
      order: 'desc',
    },
    {
      field: 'rank',
      order: 'asc',
    },
  ],
  _price_desc: {
    field: 'price',
    order: 'desc',
    nestedPath: 'variants',
    mode: 'min',
  },
  _price_asc: {
    field: 'price',
    order: 'asc',
    nestedPath: 'variants',
    mode: 'min',
  },
  _lead_asc: {
    field: 'lead_time',
    order: 'asc',
    nestedPath: 'variants',
    mode: 'min',
  },
  _lead_desc: {
    field: 'lead_time',
    order: 'desc',
    nestedPath: 'variants',
    mode: 'min',
  },
};

/**
 * 支持的索引名称基础列表
 */
export const INDEX_NAME_BASES = ['web_product', 'pos_product'] as const;

/**
 * 从 sorting 配置中提取有效的排序后缀
 * 例如: _price_asc -> price_asc
 *
 * @returns 有效的排序后缀数组
 */
export function getValidSortSuffixes(): string[] {
  return Object.keys(SEARCH_SORTING_CONFIG)
    .filter((key) => key !== 'default' && key.startsWith('_'))
    .map((key) => key.substring(1)); // 移除开头的下划线
}

/**
 * 生成有效的索引名称模式（用于正则验证）
 *
 * @returns 索引名称正则表达式数组
 */
export function getValidIndexNamePatterns(): RegExp[] {
  const sortSuffixes = Object.keys(SEARCH_SORTING_CONFIG).filter((key) => key !== 'default' && key.startsWith('_'));

  const patterns: RegExp[] = [];

  for (const indexBase of INDEX_NAME_BASES) {
    // 基础索引名（无排序后缀）
    patterns.push(new RegExp(`^${indexBase}$`));

    // 带排序后缀的索引名
    if (sortSuffixes.length > 0) {
      const suffixPattern = sortSuffixes.map((s) => s.substring(1)).join('|');
      patterns.push(new RegExp(`^${indexBase}_(${suffixPattern})$`));
    }
  }

  return patterns;
}

/**
 * 验证索引名是否有效
 *
 * @param indexName - 要验证的索引名
 * @returns 是否有效
 */
export function isValidIndexName(indexName: string): boolean {
  const patterns = getValidIndexNamePatterns();
  return patterns.some((pattern) => pattern.test(indexName));
}

/**
 * 验证排序值是否有效
 *
 * @param sortValue - 要验证的排序值（不含下划线前缀）
 * @returns 是否有效
 */
export function isValidSortValue(sortValue: string): boolean {
  const validSuffixes = getValidSortSuffixes();
  return validSuffixes.includes(sortValue);
}

/**
 * 获取所有有效的索引名（用于文档和测试）
 *
 * @returns 所有有效的索引名数组
 */
export function getAllValidIndexNames(): string[] {
  const names: string[] = [];
  const sortSuffixes = getValidSortSuffixes();

  for (const indexBase of INDEX_NAME_BASES) {
    names.push(indexBase); // 基础名
    for (const suffix of sortSuffixes) {
      names.push(`${indexBase}_${suffix}`); // 带后缀
    }
  }

  return names;
}
