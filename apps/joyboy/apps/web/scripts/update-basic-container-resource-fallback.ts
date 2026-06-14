#!/usr/bin/env ts-node
/**
 * 更新 Basic Container Resource Fallback 数据脚本
 *
 * 用途：定期从 API 拉取最新的 basic container resource 数据
 * 生成五个 fallback 文件：
 * 1. global-nav-file.tsx - Global Nav 兜底数据
 * 2. notice-file.tsx - Global Notice 兜底数据
 * 3. outer-menu-file.tsx - Outer Menu 兜底数据
 * 4. footer-file.tsx - Footer 兜底数据
 * 5. home-file.tsx - Home Page Brand Refresh 兜底数据
 *
 * 使用场景：
 * 1. 部署前执行，确保有最新的兜底数据
 * 2. 定时任务执行（如每天凌晨）
 * 3. 手动执行更新
 *
 * 运行方式：
 * pnpm ts-node apps/web/scripts/update-basic-container-resource-fallback.ts
 * 或
 * npx tsx apps/web/scripts/update-basic-container-resource-fallback.ts
 */

import fs from 'fs';
import path from 'path';

const MARKETS = ['sg', 'us', 'au', 'ca', 'uk'];
const RESOURCES = ['global-nav', 'notice', 'outer-menu', 'footer', 'home-page-brand-refresh'] as const;
const FALLBACK_DIR = path.resolve(__dirname, '../../../libs/modules/cms/services/src/fallback_resource');

interface FallbackData<T = any> {
  value: T;
  lastUpdated: string;
  note: string;
}

/**
 * 资源类型到文件名的映射
 */
const resourceFileMap: Record<string, { filename: string; description: string; methodName: string }> = {
  'global-nav': {
    filename: 'global-nav-file.tsx',
    description: 'Global Nav',
    methodName: 'getGlobalNav',
  },
  notice: {
    filename: 'notice-file.tsx',
    description: 'Global Notice',
    methodName: 'getGlobalNotice',
  },
  'outer-menu': {
    filename: 'outer-menu-file.tsx',
    description: 'Outer Menu',
    methodName: 'getGlobalMenuGroupMenu',
  },
  footer: {
    filename: 'footer-file.tsx',
    description: 'Footer',
    methodName: 'getGlobalFooter',
  },
  'home-page-brand-refresh': {
    filename: 'home-file.tsx',
    description: 'Home Page Brand Refresh',
    methodName: 'getSpecificPage',
  },
};

async function fetchResourceForMarket(market: string, resource: string): Promise<any> {
  // 根据不同市场使用不同的 API Base URL

  const baseUrls: Record<string, string> = {
    sg: process.env.SG_APP_API_BASE_URL || 'https://www.castlery.com/sg/api',
    us: process.env.US_APP_API_BASE_URL || 'https://www.castlery.com/us/api',
    au: process.env.AU_APP_API_BASE_URL || 'https://www.castlery.com/au/api',
    ca: process.env.CA_APP_API_BASE_URL || 'https://www.castlery.com/ca/api',
    uk: process.env.UK_APP_API_BASE_URL || 'https://www.castlery.com/uk/api',
  };

  const url = `${baseUrls[market]}/basic-container/${resource}`;

  try {
    console.log(`  Fetching ${resource} for ${market.toUpperCase()}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Castlery-Fallback-Updater/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const normalized = normalizeApiResponse(data);
    console.log(`  ✅ Successfully fetched ${resource} for ${market.toUpperCase()}`);
    return normalized;
  } catch (error) {
    console.error(`  ❌ Failed to fetch ${resource} for ${market.toUpperCase()}:`, error);
    throw error;
  }
}

/**
 * 某些 API 会按照 Microsoft REST 规范包一层 value
 * 这里统一解包，避免 fallback 文件出现双层 value
 */
function normalizeApiResponse(data: any): any {
  if (data && typeof data === 'object' && 'value' in data) {
    return (data as Record<string, any>).value;
  }
  return data;
}

/**
 * 生成 TypeScript fallback 文件内容
 */
function generateTypeScriptContent(
  resource: string,
  allData: Record<string, FallbackData>,
  dataType: string,
  typeDefinition: string
): string {
  const timestamp = new Date().toISOString();
  const { description, methodName } = resourceFileMap[resource];
  // 将 resource 转为常量名称：global-nav -> GLOBAL_NAV, outer-menu -> OUTER_MENU
  const constantName = `FALLBACK_${resource.toUpperCase().replace(/-/g, '_')}_DATA`;

  return `/* eslint-disable */
/**
 * ${description} Fallback Data
 *
 * 这个文件由脚本自动生成，请勿手动编辑
 * 用于 ${methodName} 方法的 fallback 数据
 * 参考 apps/web/scripts/update-basic-container-resource-fallback.ts 的逻辑
 *
 * @generated
 * @lastUpdated ${timestamp}
 */

${typeDefinition}

interface FallbackData {
  value: ${dataType};
  lastUpdated: string;
  note: string;
}

/**
 * 各市场的 ${description} 兜底数据
 * 当 Storyblok API 不可用时使用这些数据
 *
 * Edge Runtime 兼容：数据在编译时打包进 bundle
 *
 * 数据结构对应 ${methodName} 方法的返回值
 */
export const ${constantName}: Record<string, FallbackData> = ${JSON.stringify(allData, null, 2)};
`;
}

/**
 * 根据资源类型生成类型定义
 */
function getTypeDefinition(resource: string): { dataType: string; typeDefinition?: string } {
  switch (resource) {
    case 'global-nav':
      return {
        dataType: 'any[]',
      };
    case 'notice':
      return {
        dataType: '{ noticeBarData: any[]; noticeBarMobileData: any[] }',
      };
    case 'outer-menu':
      return {
        dataType: 'any[]',
      };
    case 'footer':
      return {
        dataType:
          '{ footerData: any[]; socialList: any[]; bottomList: any[]; mobileList: any[]; newsletterHeaderTitle?: string }',
      };
    case 'home-page-brand-refresh':
      return {
        dataType: 'any',
      };
    default:
      return {
        dataType: 'any',
      };
  }
}

/**
 * 生成并写入 fallback 文件
 */
function generateFallbackFile(resource: string, allData: Record<string, FallbackData>): void {
  const { filename } = resourceFileMap[resource];
  const filePath = path.join(FALLBACK_DIR, filename);
  const { dataType, typeDefinition } = getTypeDefinition(resource);

  const tsContent = generateTypeScriptContent(resource, allData, dataType, typeDefinition ?? '');

  fs.writeFileSync(filePath, tsContent, 'utf-8');
  console.log(`  ✅ Updated file: ${filename}`);
}

async function updateResource(resource: string): Promise<void> {
  console.log(`\n📦 Processing ${resource}...`);

  const allData: Record<string, FallbackData> = {};
  let successCount = 0;
  let failCount = 0;

  // 获取所有市场的数据
  for (const market of MARKETS) {
    try {
      const data = await fetchResourceForMarket(market, resource);
      const fallbackData: FallbackData = {
        value: data,
        lastUpdated: new Date().toISOString(),
        note: `Fallback data for ${market.toUpperCase()} ${resource}. Updated: ${new Date().toLocaleString()}`,
      };

      allData[market] = fallbackData;
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to update ${market.toUpperCase()} ${resource}`);
      failCount++;

      // 即使失败也添加空数据
      const emptyValue = getEmptyValueForResource(resource);
      allData[market] = {
        value: emptyValue,
        lastUpdated: new Date().toISOString(),
        note: `Failed to fetch data for ${market.toUpperCase()} ${resource}`,
      };
    }
  }

  // 生成 TypeScript 文件
  generateFallbackFile(resource, allData);

  console.log(`  📊 Summary for ${resource}:`);
  console.log(`     ✅ Success: ${successCount}/${MARKETS.length}`);
  console.log(`     ❌ Failed: ${failCount}/${MARKETS.length}`);
}

/**
 * 获取资源类型的空值
 */
function getEmptyValueForResource(resource: string): any {
  switch (resource) {
    case 'global-nav':
      return [];
    case 'notice':
      return {
        noticeBarData: [],
        noticeBarMobileData: [],
      };
    case 'outer-menu':
      return [];
    case 'footer':
      return {
        footerData: [],
        socialList: [],
        bottomList: [],
        mobileList: [],
        newsletterHeaderTitle: '',
      };
    case 'home-page-brand-refresh':
      return null;
    default:
      return null;
  }
}

async function main() {
  console.log('🚀 Starting basic container resource fallback data update...\n');

  // 确保目录存在
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
  }

  let totalSuccess = 0;
  let totalFail = 0;

  // 处理每个资源类型
  for (const resource of RESOURCES) {
    try {
      await updateResource(resource);
      totalSuccess++;
    } catch (error) {
      console.error(`💥 Fatal error processing ${resource}:`, error);
      totalFail++;
    }
  }

  console.log('\n📊 Overall Summary:');
  console.log(`   ✅ Resources processed: ${totalSuccess}/${RESOURCES.length}`);
  console.log(`   ❌ Resources failed: ${totalFail}/${RESOURCES.length}`);

  if (totalFail > 0) {
    console.log('\n⚠️  Some resources failed to update. Please check the logs above.');
  }

  console.log('\n🎉 Fallback data update complete!');
  console.log(`\nGenerated files in ${FALLBACK_DIR}:`);
  RESOURCES.forEach((r) => {
    console.log(`  - ${resourceFileMap[r].filename}`);
  });
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
