import { NextRequest } from 'next/server';
import { ApiErrors, createApiItemResponse } from '../../../utils';
import { getTaxonomiesItem } from '@castlery/modules-cms-domain/server';
import { logger } from '@castlery/observability/server';

// Route Segment Config - Next.js caching configuration
// export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-dynamic';

/**
 * GET /api/taxonomies/collections/[...permalink]
 * Returns detailed collections taxonomy data for a specific permalink in Microsoft API Guidelines format
 * Supports permalinks with slashes (e.g., tableware/all-dinnerware)
 */
export async function GET(_request: NextRequest, { params }: { params: { permalink: string[] } }) {
  try {
    // Reconstruct the full permalink from the array of segments
    const fullPermalink = params.permalink.join('/');

    if (!fullPermalink) {
      return ApiErrors.missingParameter('permalink');
    }

    const data = await getTaxonomiesItem(fullPermalink);

    if (!data) {
      return ApiErrors.notFound(`Collection item with permalink '${fullPermalink}' not found`, 'permalink');
    }

    // Return single resource response (no value wrapper)
    return createApiItemResponse(data);
  } catch (error) {
    logger.error('Error fetching collection taxonomy detail', { error });

    return ApiErrors.fetchError('collection taxonomy detail', error);
  }
}
