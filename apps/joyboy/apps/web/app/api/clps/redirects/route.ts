import { NextRequest } from 'next/server';
import { createApiListResponse, createApiErrorResponse } from '../../utils';
import { fetchFlatCategories } from '@castlery/modules-cms-domain/server';
import { logger } from '@castlery/observability/server';

// Route Segment Config - Next.js caching configuration
export const revalidate = 3600; // Revalidate every hour

type RedirectConfig = {
  permanent: boolean;
  destination: string;
};

type RedirectsResponse = Record<string, RedirectConfig>;

/**
 * GET /api/categories/redirects
 * Returns redirect configuration in Microsoft API Guidelines format
 *
 * @description Provides redirect mappings from outdated URLs to current URLs
 * @returns {ApiSuccessResponse<RedirectsResponse>} Redirect configuration object
 */
export async function GET(request: NextRequest) {
  try {
    // Use the standardized taxonomy data fetcher
    const data = await fetchFlatCategories();
    if (!data) {
      throw new Error('No categories data found');
    }

    // Flatten the menu structure to process redirects
    const redirects: RedirectsResponse = {};

    data.forEach((item) => {
      // Only handle outdated URLs - redirect them to current url
      if (item.outdated_urls && item.outdated_urls.length > 0 && item.url) {
        item.outdated_urls.forEach((outdatedUrl) => {
          if (outdatedUrl && outdatedUrl !== item.url) {
            const cleanSource = cleanUrl(outdatedUrl);
            const cleanDestination = cleanUrl(item.url || '');

            if (cleanSource && cleanDestination && cleanSource !== cleanDestination) {
              redirects[cleanSource] = {
                permanent: true,
                destination: cleanDestination,
              };
            }
          }
        });
      }
    });

    return createApiListResponse(redirects);
  } catch (error) {
    logger.error('Failed to generate redirects', { error });

    return createApiErrorResponse('InternalServerError', 'An unexpected error occurred while generating redirects', {
      innerError: error,
      status: 500,
    });
  }
}

// Helper interface for menu items

function cleanUrl(url: string): string {
  if (!url) return '';

  // Remove trailing slash if not root
  const cleaned = url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;

  // Ensure it starts with /
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}
