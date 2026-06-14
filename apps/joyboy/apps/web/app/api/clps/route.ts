import { NextRequest } from 'next/server';
import { createApiListResponse, createApiErrorResponse } from '../utils';
import { fetchFlatCategories } from '@castlery/modules-cms-domain/server';
import { logger } from '@castlery/observability/server';

export async function GET() {
  try {
    // Use the standardized taxonomy data fetcher
    const data = await fetchFlatCategories();
    if (!data) {
      throw new Error('No categories data found');
    }

    return createApiListResponse(
      data.map((item) => ({
        url: item.url,
        permalink: item.permalink,
      }))
    );
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
