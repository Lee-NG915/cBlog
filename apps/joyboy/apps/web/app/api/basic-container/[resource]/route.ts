import { sbApiClient } from '@castlery/modules-cms-components';
import { EcEnv } from '@castlery/config';
import { NextRequest } from 'next/server';
import { createApiListResponse, createApiErrorResponse, ApiErrors } from '../../utils';
import { logger } from '@castlery/observability/server';
import { createPDPUSPExcel, createSofaComfortVideoExcel } from '../../services/excelService';

// Route Segment Config - Next.js caching configuration
// Route 层缓存组合后的数据，Service 层缓存原始 CMS 数据
// 两层缓存各司其职：Service 层处理容错，Route 层减少组合计算
export const revalidate = 300;

/**
 * 资源类型映射
 */
const HOME_PAGE_BRAND_REFRESH_SLUG = 'general-content-v2/main-pages/home-page-brand-refresh';

const resourceMethodMap: Record<string, () => Promise<any>> = {
  'global-nav': () => sbApiClient.getGlobalNav(),
  notice: () => sbApiClient.getGlobalNotice(),
  'outer-menu': () => sbApiClient.getGlobalMenuGroupMenu(),
  footer: () => sbApiClient.getGlobalFooter(),
  'home-page-brand-refresh': () =>
    sbApiClient.getSpecificPage(
      `${EcEnv.NEXT_PUBLIC_COUNTRY?.toLocaleLowerCase() || 'sg'}/${HOME_PAGE_BRAND_REFRESH_SLUG}`
    ),
  'pdp-usp-excel-download': () => sbApiClient.getPDPDataBucketWithoutCache(),
  'sofa-comfort-video': () => sbApiClient.getPDPDataBucketWithoutCache(),
};

/**
 * GET /api/basic-container/[resource]
 * Returns basic container resource data in Microsoft API Guidelines format
 *
 * @description Provides basic container resource data based on resource type
 * Supported resources: global-nav, notice, outer-menu, footer
 * @returns {ApiSuccessResponse<BasicContainerResource>} Basic container resource data
 */
export async function GET(_request: NextRequest, { params }: { params: { resource: string } }) {
  try {
    const { resource } = params;

    // 验证资源类型
    if (!resource || !resourceMethodMap[resource]) {
      return ApiErrors.notFound(
        `Resource type '${resource}' is not supported. Supported types: ${Object.keys(resourceMethodMap).join(', ')}`,
        'resource'
      );
    }
    if (resource === 'pdp-usp-excel-download' || resource === 'sofa-comfort-video') {
      // 环境检查：只在 test 和 uat 环境允许下载 Excel
      const applicationEnv = EcEnv.NEXT_PUBLIC_APPLICATION_ENV;
      const isTestEnv = applicationEnv.includes('test');
      const isUatEnv = applicationEnv.includes('uat');

      if (!isTestEnv && !isUatEnv) {
        return createApiErrorResponse('Forbidden', 'Excel download is only available in test and uat environments', {
          target: 'environment',
          status: 403,
        });
      }

      let excelBuffer: Buffer;
      let fileNamePrefix: string;
      switch (resource) {
        case 'pdp-usp-excel-download':
          excelBuffer = await createPDPUSPExcel();
          fileNamePrefix = 'pdp-usp';
          break;
        case 'sofa-comfort-video':
          excelBuffer = await createSofaComfortVideoExcel();
          fileNamePrefix = 'sofa-comfort-video';
          break;
        default:
          return ApiErrors.notFound(`Resource type '${resource}' is not supported`, 'resource');
      }

      // 返回 Excel 文件响应
      return new Response(new Uint8Array(excelBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileNamePrefix}-${EcEnv.NEXT_PUBLIC_COUNTRY?.toLocaleLowerCase()}.xlsx"`,
        },
      });
    }

    // 获取对应的方法并调用
    const method = resourceMethodMap[resource];
    const data = await method();

    // 如果数据为空或未定义，返回 404
    if (data === null || data === undefined) {
      return ApiErrors.notFound(`No data found for resource type '${resource}'`, 'resource');
    }

    // Return single resource response (no value wrapper)
    return createApiListResponse(data);
  } catch (error) {
    logger.error('Error fetching basic container resource', { error, resource: params.resource });

    return createApiErrorResponse(
      'InternalServerError',
      'An unexpected error occurred while fetching basic container resource',
      {
        innerError: error,
        status: 500,
      }
    );
  }
}
