import { NextRequest } from 'next/server';
import { createApiListResponse, createApiErrorResponse, withRetry } from '../utils';
import { fetchFlatCategories } from '@castlery/modules-cms-domain/server';
import { logger } from '@castlery/observability/server';

export async function GET() {
  try {
    // Use the standardized taxonomy data fetcher with retry mechanism
    const data = await withRetry(
      async () => {
        const result = await fetchFlatCategories();
        if (!result) {
          throw new Error('No categories data found');
        }
        return result;
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 5000,
      }
    );

    return createApiListResponse(
      data.map((item) => ({
        url: item.url,
        permalink: item.permalink,
        outdatedUrls: item.outdated_urls || [],
      }))
    );
  } catch (error) {
    logger.error('Error fetching categories data after retries', { error });

    const tempDatas = [
      {
        url: '/sofas/all-sofas',
        permalink: 'sofas',
        outdatedUrls: [
          '/living-room/all-sofas',
          '/sofas',
          '/all-sofas',
          '/living-room/sofas',
          '/living-room/all-living-room',
          '/living-room',
        ],
      },
      {
        url: '/sofas/sectional-sofas',
        permalink: 'sofas/sectional-sofas',
        outdatedUrls: ['/living-room/sectional-l-shaped-sofas', '/living-room/sectional-sofas'],
      },
      {
        url: '/sofas/2-seater-sofas',
        permalink: 'sofas/2-seater-sofas',
        outdatedUrls: ['/living-room/2-seater-sofas'],
      },
      {
        url: '/sofas/3-seater-sofas',
        permalink: 'sofas/3-seater-sofas',
        outdatedUrls: ['/living-room/3-seater-sofas'],
      },
      {
        url: '/sofas/modular-sofas',
        permalink: 'sofas/modular-sofa',
        outdatedUrls: [],
      },
      {
        url: '/sofas/leather-sofas',
        permalink: 'sofas/leather-sofas',
        outdatedUrls: ['/living-room/leather-sofas', '/leather-sofas'],
      },
      {
        url: '/sofas/chaise-lounges',
        permalink: 'sofas/chaise-lounge',
        outdatedUrls: [],
      },
      {
        url: '/sofas/ottomans-poufs',
        permalink: 'sofas/ottomans-poufs',
        outdatedUrls: ['/living-room/ottomans-poufs'],
      },
      {
        url: '/furniture-sets/living-room-sets',
        permalink: 'sofas/living-room-bundles',
        outdatedUrls: ['/living-room/living-room-bundles', '/furniture-sets/living-room-bundles'],
      },
      {
        url: '/shop-the-room/living-room',
        permalink: 'sofas/living-room',
        outdatedUrls: [],
      },
      {
        url: '/bestselling-sofas',
        permalink: 'sofas/bestselling-sofas',
        outdatedUrls: [],
      },
      {
        url: '/sofas/recliner-sofas-and-armchairs',
        permalink: 'sofas/recliner-sofas-and-armchairs',
        outdatedUrls: [],
      },
      {
        url: '/tables/all-tables',
        permalink: 'tables',
        outdatedUrls: [],
      },
      {
        url: '/tables/dining-tables',
        permalink: 'tables/dining-tables',
        outdatedUrls: ['/dining-room/dining-tables', '/dining-room/all-dining-room', '/dining-room'],
      },
      {
        url: '/tables/coffee-tables',
        permalink: 'tables/coffee-tables',
        outdatedUrls: ['/living-room/coffee-tables'],
      },
      {
        url: '/tables/side-tables',
        permalink: 'tables/side-tables',
        outdatedUrls: ['/living-room/side-tables'],
      },
      {
        url: '/tables/desks',
        permalink: 'tables/study-tables',
        outdatedUrls: ['/home-office/desks', '/home-office/study-tables', '/home-office'],
      },
      {
        url: '/tables/console-tables',
        permalink: 'tables/console-tables',
        outdatedUrls: ['/entryway/console-tables', '/storage/console-tables'],
      },
      {
        url: '/furniture-sets/dining-room-sets',
        permalink: 'tables/dining-room-bundles',
        outdatedUrls: [
          '/dining-room/dining-room-bundles',
          '/dining-room/dining-sets',
          '/furniture-sets/dining-room-bundles',
        ],
      },
      {
        url: 'sg/shop-the-room/dining-room',
        permalink: 'tables/dining-room',
        outdatedUrls: [],
      },
      {
        url: '/chairs/all-chairs',
        permalink: 'chairs',
        outdatedUrls: ['/chairs-benches/all-chairs'],
      },
      {
        url: '/chairs/armchairs',
        permalink: 'chairs/armchairs',
        outdatedUrls: ['/chairs-benches/armchairs'],
      },
      {
        url: '/chairs/dining-chairs',
        permalink: 'chairs/dining-chairs',
        outdatedUrls: ['/chairs-benches/dining-chairs'],
      },
      {
        url: '/chairs/stools-bar-stools',
        permalink: 'chairs/stools-barstools',
        outdatedUrls: ['/chairs-benches/stools-bar-stools'],
      },
      {
        url: '/chairs/benches',
        permalink: 'chairs/dining-benches',
        outdatedUrls: ['/dining-room/dining-benches', '/entryway/seating', '/entryway', ' /chairs-benches/benches'],
      },
      {
        url: '/chairs/office-chairs',
        permalink: 'chairs/office-chairs',
        outdatedUrls: ['/chairs-benches/office-chairs'],
      },
      {
        url: '/furniture-sets/dining-room-sets',
        permalink: 'chairs/dining-room-bundles',
        outdatedUrls: [
          '/dining-room/dining-room-bundles',
          '/dining-room/dining-sets',
          '/furniture-sets/dining-room-bundles',
        ],
      },
      {
        url: '/beds/all-bedroom',
        permalink: 'beds',
        outdatedUrls: ['/bedroom/all-bedroom', '/bedroom'],
      },
      {
        url: '/beds/beds',
        permalink: 'beds/bedframes',
        outdatedUrls: ['/bedroom/bed-frames', '/bedroom/bedframes'],
      },
      {
        url: '/beds/bedside-tables',
        permalink: 'beds/bedside-tables',
        outdatedUrls: ['/bedroom/bedside-tables'],
      },
      {
        url: '/beds/dressers',
        permalink: 'beds/dressers',
        outdatedUrls: ['/storage/dressers', '/bedroom/dressers-sideboards'],
      },
      {
        url: '/beds/bedroom-benches',
        permalink: 'beds/bedroom-benches',
        outdatedUrls: [],
      },
      {
        url: '/beds/mattress',
        permalink: 'beds/mattresses',
        outdatedUrls: [],
      },
      {
        url: '/beds/bedding',
        permalink: 'beds/all-beddings',
        outdatedUrls: [
          '/accessories/bedding',
          '/bedding',
          '/accessories/beddings',
          '/bedding/quilts',
          '/bedding/pillows',
        ],
      },
      {
        url: '/furniture-sets/bedroom-sets',
        permalink: 'beds/bedroom-bundles',
        outdatedUrls: ['/bedroom/bedroom-bundles', '/furniture-sets/bedroom-room-bundles'],
      },
      {
        url: '/shop-the-room/bedroom',
        permalink: 'beds/bedroom',
        outdatedUrls: [],
      },
      {
        url: '/storage/all-storage',
        permalink: 'storage',
        outdatedUrls: [
          '/storage',
          '/living-room/shelves-cabinets',
          '/entryway/storage',
          '/dining-room/storage-shelves',
          '/bedroom/bedroom-storage',
          '/home-office/office-storage',
        ],
      },
      {
        url: '/storage/tv-consoles',
        permalink: 'storage/tv-consoles',
        outdatedUrls: ['/living-room/tv-consoles'],
      },
      {
        url: '/storage/sideboards-cabinets',
        permalink: 'storage/sideboards-cabinets',
        outdatedUrls: ['/storage/dressers'],
      },
      {
        url: '/beds/dressers',
        permalink: 'storage/dressers',
        outdatedUrls: ['/storage/dressers'],
      },
      {
        url: '/storage/shelves-bookcases',
        permalink: 'storage/shelves-bookcases',
        outdatedUrls: ['/storage/shelves-coat-racks'],
      },
      {
        url: '/furniture-sets/all-furniture-sets',
        permalink: 'furniture-sets',
        outdatedUrls: ['/furniture-sets/all-bundles'],
      },
      {
        url: '/furniture-sets/living-room-sets',
        permalink: 'furniture-sets/living-room-bundles',
        outdatedUrls: ['/living-room/living-room-bundles', '/furniture-sets/living-room-bundles'],
      },
      {
        url: '/furniture-sets/dining-room-sets',
        permalink: 'furniture-sets/dining-room-bundles',
        outdatedUrls: [
          '/dining-room/dining-room-bundles',
          '/dining-room/dining-sets',
          '/furniture-sets/dining-room-bundles',
        ],
      },
      {
        url: '/furniture-sets/bedroom-sets',
        permalink: 'furniture-sets/bedroom-bundles',
        outdatedUrls: ['/bedroom/bedroom-bundles', '/furniture-sets/bedroom-room-bundles'],
      },
      {
        url: '/furniture-sets/outdoor-sets',
        permalink: 'furniture-sets/outdoor-furniture-sets',
        outdatedUrls: ['/outdoor/outdoor-furniture-sets'],
      },
      {
        url: '/outdoor/all-outdoor',
        permalink: 'outdoor',
        outdatedUrls: ['/outdoor/all-outdoor-furniture', '/outdoor-furniture', '/outdoor'],
      },
      {
        url: '/outdoor/outdoor-sofas',
        permalink: 'outdoor/outdoor-sofas',
        outdatedUrls: ['/outdoor/outdoor-lounge-furniture'],
      },
      {
        url: '/outdoor/outdoor-dining-and-bar-tables',
        permalink: 'outdoor/outdoor-dining-and-bar-tables',
        outdatedUrls: ['/outdoor/outdoor-tables', '/outdoor/outdoor-dining-furniture'],
      },
      {
        url: '/outdoor/outdoor-coffee-and-side-tables',
        permalink: 'outdoor/outdoor-coffee-and-side-tables',
        outdatedUrls: [],
      },
      {
        url: '/outdoor/outdoor-chairs-bar-stools',
        permalink: 'outdoor/outdoor-chairs-bar-stools',
        outdatedUrls: ['/outdoor/outdoor-chairs'],
      },
      {
        url: '/outdoor/outdoor-lounge-chairs',
        permalink: 'outdoor/outdoor-lounge-chairs',
        outdatedUrls: [],
      },
      {
        url: '/furniture-sets/outdoor-sets',
        permalink: 'outdoor/outdoor-sets',
        outdatedUrls: [],
      },
      {
        url: '/outdoor/outdoor-accessories',
        permalink: 'outdoor/outdoor-accessories',
        outdatedUrls: [],
      },
      {
        url: '/shop-the-room/outdoor',
        permalink: 'outdoor/outdoor',
        outdatedUrls: [],
      },
      {
        url: '/accessories/all-accessories',
        permalink: 'accessories',
        outdatedUrls: ['/accessories', '/living-room/sofa-covers', '/accessories/fabric-covers'],
      },
      {
        url: '/accessories/rugs',
        permalink: 'accessories/all-rugs',
        outdatedUrls: ['/accessories/all-rugs'],
      },
      {
        url: '/accessories/poufs-cushions-throws',
        permalink: 'accessories/all-poufs-cushions-throws',
        outdatedUrls: [
          '/accessories/all-poufs-cushions-throws',
          '/all-poufs-cushions-throws',
          '/poufs-cushion-pillows',
          '/accessories/throw-pillows',
        ],
      },
      {
        url: '/accessories/mirrors',
        permalink: 'accessories/all-mirrors',
        outdatedUrls: [],
      },
      {
        url: '/accessories/lighting',
        permalink: 'accessories/all-lighting',
        outdatedUrls: [
          '/lighting/all-lighting',
          '/lighting/floor-lamps',
          '/lighting/table-lamps',
          '/lighting/pendant-lights',
          '/lighting',
        ],
      },
      {
        url: '/beds/bedding',
        permalink: 'accessories/all-beddings',
        outdatedUrls: [],
      },
      {
        url: '/accessories/sofa-and-bed-covers',
        permalink: 'accessories/sofa-and-bed-covers',
        outdatedUrls: [],
      },
      {
        url: '/accessories/dinnerware',
        permalink: 'accessories/all-dinnerware',
        outdatedUrls: [
          '/tableware/all-tableware',
          '/tableware/plates-bowls',
          '/tableware/glassware',
          '/tableware/cutlery',
          '/tableware/tableware-sets',
          '/accessories/glassware',
          '/accessories/cutlery',
        ],
      },
      {
        url: '/accessories/sofa-headrests-and-remote-holders',
        permalink: 'accessories/sofa-headrests-and-remote-holders',
        outdatedUrls: [],
      },
    ];
    return createApiListResponse(tempDatas);
  }
}
