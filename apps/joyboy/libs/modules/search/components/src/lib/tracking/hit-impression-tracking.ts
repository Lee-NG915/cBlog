import { logger } from '@castlery/observability/client';

export interface HitData {
  hitIndex: string;
  hitSku: string;
}

// Global state for tracking
let impressionObserver: IntersectionObserver | null = null;
let impressionBatch: HitData[] = [];
let impressionTimer: NodeJS.Timeout | null = null;
const trackedImpressionIds: Set<HitData['hitIndex']> = new Set();

function observeProductElements() {
  if (!impressionObserver) return;

  const productElements = document.querySelectorAll('[data-hit-index]');
  productElements.forEach((el) => {
    if (!el.hasAttribute('data-impression-observed')) {
      impressionObserver!.observe(el);
      el.setAttribute('data-impression-observed', 'true');
    }
  });
}

function addToImpressionBatch(hitData: HitData, trackingHandler: (hitDatas: HitData[]) => void) {
  // Check if this impression was already tracked
  if (trackedImpressionIds.has(hitData.hitIndex)) return;

  impressionBatch.push(hitData);

  // Clear existing timer
  if (impressionTimer) {
    clearTimeout(impressionTimer);
  }

  // Set new timer for batch processing
  impressionTimer = setTimeout(() => {
    processImpressionBatch(trackingHandler);
  }, 500);
}

function trackProductImpression(hitDatas: HitData[], trackingHandler: (hitDatas: HitData[]) => void) {
  // Track using existing PLP impression event
  trackingHandler(hitDatas);
  // Mark as tracked to prevent duplicate tracking
  hitDatas?.forEach((hit) => trackedImpressionIds.add(hit.hitIndex));
}

function processImpressionBatch(trackingHandler: (hitDatas: HitData[]) => void) {
  if (impressionBatch.length === 0) return;

  // Process each impression
  trackProductImpression(impressionBatch, trackingHandler);

  // Clear the batch
  impressionBatch = [];
}
// Impression tracking
export function initializeImpressionTracking(trackingHandler: (hitDatas: HitData[]) => void) {
  if (typeof window === 'undefined') return;

  impressionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const productElement = entry.target as HTMLElement;
          const hitIndex = productElement.dataset.hitIndex;
          const hitSku = productElement.dataset.hitSku;

          if (hitIndex && hitSku) {
            try {
              addToImpressionBatch({ hitIndex, hitSku }, trackingHandler);
            } catch (error) {
              // Tracking error should not block the main flow
              logger.error('Failed to parse hit data for impression tracking', { error, hitIndex, hitSku });
            }
          }
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: '0px 0px -10% 0px', // Start tracking when 90% of element is visible
    }
  );

  // Start observing existing product elements
  observeProductElements();
}

// Function to re-observe elements when new hits are loaded
export function reobserveProductElements() {
  if (!impressionObserver) return;

  // Clear existing observations
  impressionObserver.disconnect();

  // Remove all data-impression-observed attributes
  const existingElements = document.querySelectorAll('[data-impression-observed]');
  existingElements.forEach((el) => {
    el.removeAttribute('data-impression-observed');
  });

  // Re-observe all product elements
  observeProductElements();
}

// Function to reset tracking state when search results change
export function resetImpressionTracking() {
  trackedImpressionIds.clear();
  impressionBatch = [];

  if (impressionTimer) {
    clearTimeout(impressionTimer);
    impressionTimer = null;
  }
}

export function cleanupTrackingImpression() {
  if (impressionObserver) {
    impressionObserver.disconnect();
    impressionObserver = null;
  }

  if (impressionTimer) {
    clearTimeout(impressionTimer);
    impressionTimer = null;
  }

  impressionBatch = [];
  trackedImpressionIds.clear();
}
