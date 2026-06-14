import { sbApiClient } from '@castlery/modules-cms-components';
import * as XLSX from 'xlsx';

/**
 * Excel 服务
 * 用于生成和处理 Excel 文件
 */

/**
 * 创建空的 Excel 工作簿
 * @param sheetName 工作表名称，默认为 'Sheet1'
 * @returns Excel 文件的 Buffer
 */
export function createEmptyExcel(sheetName = 'Sheet1'): Buffer {
  // 创建一个空的工作簿
  const workbook = XLSX.utils.book_new();
  // 创建一个空的工作表
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  // 将工作簿转换为 buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * 创建包含数据的 Excel 工作簿
 * @param data 二维数组数据，第一行为表头
 * @param sheetName 工作表名称，默认为 'Sheet1'
 * @returns Excel 文件的 Buffer
 */
export function createExcelFromData(data: (string | number | boolean | null)[][], sheetName = 'Sheet1'): Buffer {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * 从 story slug 中提取产品 slug
 * 例如：sg/general-configuration/universal-config-new-joyboy/pdp/data-bucket/mori-performance-fabric-left-chaise
 * 返回：mori-performance-fabric-left-chaise
 */
function extractProductSlug(fullSlug: string): string {
  const parts = fullSlug.split('/');
  return parts[parts.length - 1] || fullSlug;
}

/**
 * 创建 PDP USP Excel 文件
 * @returns Excel 文件的 Buffer
 */
export async function createPDPUSPExcel(): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // 创建表头行：A1=SPU Slug, B1=USP Template Data Selector, E1=USP Content
  const headerRow: (string | null)[] = ['SPU Slug', 'USP Template Data Selector', null, null, null, 'USP Content'];
  const subHeaderRow: (string | null)[] = [
    'SPU Slug',
    'USP A Indices',
    'USP B Indices',
    'USP C Indices',
    'USP D Indices',
    'USP Field',
    'USP1',
    'USP2',
    'USP3',
    'USP4',
    'USP5',
    'USP6',
    'USP7',
    'USP8',
    'USP9',
  ];

  // 构建完整的数据数组
  const allData: (string | number | boolean | null)[][] = [headerRow, subHeaderRow];

  // 获取 PDP 数据桶
  const pdpDataBucket = await sbApiClient.getPDPDataBucketWithoutCache();

  // 处理每个 story 的数据
  for (const story of pdpDataBucket) {
    if (!story.content) continue;

    const productSlug = extractProductSlug(story.slug || story.full_slug || '');
    const { uspData, uspVariantA, uspVariantB, uspVariantC, uspVariantD } = story.content;

    if (!uspData || uspData.length === 0) continue;

    // 获取 USP B 和 C 的索引
    const uspAIndices =
      uspVariantA
        ?.filter((item: any) => item?.dataIndex)
        ?.map((item: any) => item.dataIndex)
        ?.join(',') || '';
    const uspBIndices =
      uspVariantB
        ?.filter((item: any) => item?.dataIndex)
        ?.map((item: any) => item.dataIndex)
        ?.join(',') || '';

    const uspCIndices =
      uspVariantC
        ?.filter((item: any) => item?.dataIndex)
        ?.map((item: any) => item.dataIndex)
        ?.join(',') || '';

    const uspDIndices =
      uspVariantD
        ?.filter((item: any) => item?.dataIndex)
        ?.map((item: any) => item.dataIndex)
        ?.join(',') || '';

    // 获取所有需要显示的 USP 索引（A、B、C 和 D 的并集）
    const allIndices = new Set<string>();
    uspVariantA?.forEach((item: any) => {
      if (item?.dataIndex) allIndices.add(item.dataIndex);
    });
    uspVariantB?.forEach((item: any) => {
      if (item?.dataIndex) allIndices.add(item.dataIndex);
    });
    uspVariantC?.forEach((item: any) => {
      if (item?.dataIndex) allIndices.add(item.dataIndex);
    });
    uspVariantD?.forEach((item: any) => {
      if (item?.dataIndex) allIndices.add(item.dataIndex);
    });

    const sortedIndices = Array.from(allIndices).sort((a, b) => Number(a) - Number(b));

    if (sortedIndices.length === 0) continue;

    // 为每个字段创建一行数据
    const fieldRows = [
      { field: 'usp_title', getValue: (usp: any) => usp?.title || '' },
      { field: 'usp_description', getValue: (usp: any) => usp?.description || '' },
      {
        field: 'usp_media',
        getValue: (usp: any) => {
          // 返回完整的 media URL
          if (usp?.media?.filename) {
            return usp.media.filename;
          }
          return '';
        },
      },
      { field: 'usp_cta', getValue: (usp: any) => usp?.ctaText || '' },
      {
        field: 'usp_link',
        getValue: (usp: any) => {
          if (usp?.link?.linktype === 'url') return usp.link.url || '';
          if (usp?.link?.linktype === 'story') return usp.link.cached_url || '';
          return '';
        },
      },
    ];

    // 创建数据行（5行数据）
    fieldRows.forEach((fieldRow, rowIndex) => {
      const row: (string | null)[] = [
        rowIndex === 0 ? productSlug : null, // A列：SPU Slug（只在第一行有值）
        rowIndex === 0 ? uspAIndices : null, // B列：USP A Indices（只在第一行有值）
        rowIndex === 0 ? uspBIndices : null, // C列：USP B Indices（只在第一行有值）
        rowIndex === 0 ? uspCIndices : null, // D列：USP C Indices（只在第一行有值）
        rowIndex === 0 ? uspDIndices : null, // E列：USP D Indices（只在第一行有值）
        fieldRow.field, // F列：USP Field
      ];

      // F列开始：每个USP的值
      for (const index of sortedIndices) {
        const uspIndex = Number(index) - 1;
        const usp = uspData[uspIndex];
        const value = usp ? fieldRow.getValue(usp) : '';
        row.push(value);
      }

      // 如果USP数量少于9个，用空值填充到USP9
      while (row.length < 15) {
        row.push(null);
      }

      allData.push(row);
    });
  }

  // 从数据数组创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(allData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PDP USP');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * 创建 Sofa Comfort Video Excel 文件
 * 表头：slug, persona, video_url
 * 每个 data bucket story 按 sofaComfortVideos 数量展开成多行
 */
export async function createSofaComfortVideoExcel(): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();
  const allData: (string | number | boolean | null)[][] = [['slug', 'persona', 'video_url']];

  const pdpDataBucket = await sbApiClient.getPDPDataBucketWithoutCache();

  for (const story of pdpDataBucket) {
    if (!story?.content) continue;

    const productSlug = extractProductSlug(story.slug || story.full_slug || '');
    const sofaComfortVideos = story.content.sofaComfortVideos;

    if (!Array.isArray(sofaComfortVideos) || sofaComfortVideos.length === 0) {
      continue;
    }

    sofaComfortVideos.forEach((video: any, index: number) => {
      const persona = video?.persona || '';
      const videoUrl = video?.media?.filename || '';

      allData.push([index === 0 ? productSlug : null, persona, videoUrl]);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(allData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sofa Comfort Video');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
