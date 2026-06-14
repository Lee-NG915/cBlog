import { NextRequest } from 'next/server';
import { fetchCategories } from '@castlery/modules-cms-domain/server';
import { createApiListResponse, createApiErrorResponse } from '../../utils';
import { SimplifiedTaxonomyItem } from '@castlery/types';
import { logger } from '@castlery/observability/server';

export const dynamic = 'force-dynamic';

function simplifyTaxonomyItem(item: SimplifiedTaxonomyItem): SimplifiedTaxonomyItem {
  return {
    name: item.name,
    permalink: item.permalink,
    url: item.url,
    image: item.image,
    children: item.children ? item.children.map((child) => simplifyTaxonomyItem(child)) : [],
  };
}

export async function GET() {
  try {
    // Use the standardized taxonomy data fetcher
    const { data } = await fetchCategories();
    if (!data) {
      throw new Error('No categories data found');
    }

    return createApiListResponse(data.map((item) => simplifyTaxonomyItem(item)));
  } catch (error) {
    logger.error('Error fetching categories data', { error });

    return createApiErrorResponse(
      'InternalServerError',
      'An unexpected error occurred while fetching categories data',
      {
        innerError: error,
        status: 500,
      }
    );
  }
}
