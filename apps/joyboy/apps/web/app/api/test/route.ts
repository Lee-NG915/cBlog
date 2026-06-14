import { sbApiClient } from '@castlery/modules-cms-components';
import { EcEnv } from '@castlery/config';
import { ISbStoryData } from '@storyblok/react';
import type { SaleInfo, SaleType } from '@castlery/types';
import { NextRequest } from 'next/server';
import { createApiListResponse, createApiErrorResponse } from '../utils';
import { logger } from '@castlery/observability/server';
import { fetchFlatTaxonomies } from '@castlery/modules-cms-domain/server';

// Route Segment Config - Next.js caching configuration
export const revalidate = 3600; // Revalidate every hour

const saleTypeMap: Record<SaleType, SaleType> = {
  regular: 'regular',
  seo: 'seo',
  visual: 'visual',
  'visual-seo': 'visual-seo',
};

/**
 * GET /api/sales
 * Returns sale page URLs in Microsoft API Guidelines format
 *
 * @description Provides URLs for both traditional and visual sale pages
 * @returns {ApiSuccessResponse<SaleUrl[]>} Collection of sale page URLs
 */
export async function GET(request: NextRequest) {
  try {
    const res = await fetchFlatTaxonomies();
    return createApiListResponse(res);
  } catch (error) {
    logger.error('Error fetching sales data', { error });

    return createApiErrorResponse('InternalServerError', 'An unexpected error occurred while fetching sales data', {
      innerError: error,
      status: 500,
    });
  }
}
