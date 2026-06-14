import { NextRequest } from 'next/server';
import { fetchCollections } from '@castlery/modules-cms-domain/server';
import { ApiErrors, createApiListResponse } from '../../utils';
import { logger } from '@castlery/observability/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/taxonomies/collections
 * Returns simplified collections taxonomy data in Microsoft API Guidelines format
 */
export async function GET(_request: NextRequest) {
  try {
    // Fetch original data from backend
    const { data } = await fetchCollections();
    // Return standardized API response with Microsoft API Guidelines format
    if (!data) {
      throw new Error('No collections data found');
    }
    return createApiListResponse(
      data.map((item) => ({
        name: item.name,
        permalink: item.permalink,
        url: item.url,
        image: item.image,
        children: item.children,
      }))
    );
  } catch (error) {
    logger.error('Error fetching collections taxonomies', { error });

    return ApiErrors.fetchError('collections taxonomies', error);
  }
}
