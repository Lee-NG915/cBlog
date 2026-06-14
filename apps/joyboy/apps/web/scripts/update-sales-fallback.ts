#!/usr/bin/env ts-node
/**
 * 更新 Sales Fallback 数据脚本
 *
 * 用途：定期从 API 拉取最新的 sale pages 数据
 * 生成：
 * 1. TypeScript 常量文件（middleware/lib/fallbackData.ts）- 用于 Edge Runtime
 * 2. JSON 文件（public/fallback/*.json）- 用于备份和查看
 *
 * 使用场景：
 * 1. 部署前执行，确保有最新的兜底数据
 * 2. 定时任务执行（如每天凌晨）
 * 3. 手动执行更新
 *
 * 运行方式：
 * pnpm tsx apps/web/scripts/update-sales-fallback.ts
 */

import fs from 'fs';
import path from 'path';

const MARKETS = ['sg', 'us', 'au', 'ca', 'uk'];
const FALLBACK_JSON_DIR = path.join(__dirname, '../public/fallback');
const FALLBACK_TS_FILE = path.join(__dirname, '../middleware/lib/fallbackData.ts');

interface SaleInfo {
  url: string;
  uuid: string;
  type: string;
  outdatedUrls?: string[];
  query_deliver_before?: string;
}

interface FallbackData {
  value: SaleInfo[];
  lastUpdated: string;
  note: string;
}

async function fetchSalesForMarket(market: string): Promise<SaleInfo[]> {
  // 根据不同市场使用不同的 API Base URL
  const baseUrls: Record<string, string> = {
    sg: process.env.SG_APP_API_BASE_URL || 'https://www.castlery.com/sg/api',
    us: process.env.US_APP_API_BASE_URL || 'https://www.castlery.com/us/api',
    au: process.env.AU_APP_API_BASE_URL || 'https://www.castlery.com/au/api',
    ca: process.env.CA_APP_API_BASE_URL || 'https://www.castlery.com/ca/api',
    uk: process.env.UK_APP_API_BASE_URL || 'https://www.castlery.com/uk/api',
  };

  const url = `${baseUrls[market]}/sales`;

  try {
    console.log(`Fetching sales data for ${market.toUpperCase()}...`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Castlery-Fallback-Updater/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.value?.length || 0} sales for ${market.toUpperCase()}`);
    return data.value || [];
  } catch (error) {
    console.error(`❌ Failed to fetch sales for ${market.toUpperCase()}:`, error);
    throw error;
  }
}

async function updateJsonFallbackFile(market: string, sales: SaleInfo[]): Promise<void> {
  const filePath = path.join(FALLBACK_JSON_DIR, `sales-${market}.json`);

  const fallbackData: FallbackData = {
    value: sales,
    lastUpdated: new Date().toISOString(),
    note: `Fallback data for ${market.toUpperCase()} sale pages. Last updated: ${new Date().toLocaleString()}`,
  };

  fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
  console.log(`✅ Updated JSON file: ${filePath}`);
}

function generateTypeScriptFile(allData: Record<string, FallbackData>): void {
  const timestamp = new Date().toISOString();

  const tsContent = `/* eslint-disable */
/**
 * Sales Fallback Data
 * 
 * 这个文件由脚本自动生成，请勿手动编辑
 * 运行更新脚本: pnpm tsx apps/web/scripts/update-sales-fallback.ts
 * 
 * @generated
 * @lastUpdated ${timestamp}
 */

import type { SaleInfo } from '@castlery/types';

interface FallbackData {
  value: SaleInfo[];
  lastUpdated: string;
  note: string;
}

/**
 * 各市场的 Sale Pages 兼底数据
 * 当 API 不可用时使用这些数据
 * 
 * Edge Runtime 兼容：数据在编译时打包进 bundle
 */
export const FALLBACK_SALES_DATA: Record<string, FallbackData> = ${JSON.stringify(allData, null, 2)};
`;

  fs.writeFileSync(FALLBACK_TS_FILE, tsContent, 'utf-8');
  console.log(`✅ Updated TypeScript file: ${FALLBACK_TS_FILE}`);
}

async function main() {
  console.log('🚀 Starting sales fallback data update...\n');

  // 确保目录存在
  if (!fs.existsSync(FALLBACK_JSON_DIR)) {
    fs.mkdirSync(FALLBACK_JSON_DIR, { recursive: true });
  }

  const allData: Record<string, FallbackData> = {};
  let successCount = 0;
  let failCount = 0;

  // 获取所有市场的数据
  for (const market of MARKETS) {
    try {
      const sales = await fetchSalesForMarket(market);
      const fallbackData: FallbackData = {
        value: sales,
        lastUpdated: new Date().toISOString(),
        note: `Fallback data for ${market.toUpperCase()}. Updated: ${new Date().toLocaleString()}`,
      };

      allData[market] = fallbackData;

      // 同时保存 JSON 文件作为备份
      await updateJsonFallbackFile(market, sales);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to update ${market.toUpperCase()}`);
      failCount++;

      // 即使失败也添加空数据
      allData[market] = {
        value: [],
        lastUpdated: new Date().toISOString(),
        note: `Failed to fetch data for ${market.toUpperCase()}`,
      };
    }
    console.log(''); // 空行分隔
  }

  // 生成 TypeScript 文件
  console.log('\n📝 Generating TypeScript fallback data file...');
  generateTypeScriptFile(allData);

  console.log('\n📊 Summary:');
  console.log(`   ✅ Success: ${successCount}/${MARKETS.length}`);
  console.log(`   ❌ Failed: ${failCount}/${MARKETS.length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some markets failed to update. TypeScript file generated with empty data for failed markets.');
  }

  console.log('\n🎉 Fallback data update complete!');
  console.log(`\nGenerated files:`);
  console.log(`  - ${FALLBACK_TS_FILE}`);
  MARKETS.forEach((m) => console.log(`  - ${path.join(FALLBACK_JSON_DIR, `sales-${m}.json`)}`));
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
