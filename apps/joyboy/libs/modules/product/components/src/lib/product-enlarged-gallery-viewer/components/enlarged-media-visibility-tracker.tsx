'use client';

import { Box } from '@castlery/fortress';
import { Image } from '@castlery/modules-product-domain';
import { useCallback, useEffect, useRef } from 'react';

const ENLARGED_VIEWER_TRACKING_DELAY = 5000;
const ENLARGED_VIEWER_VISIBILITY_THRESHOLD = 0.6;

export interface EnlargedGalleryTrackingPayload {
  assetPosition: number | string;
  assetType: string;
}

interface EnlargedMediaVisibilityTrackerProps {
  active: boolean;
  children: React.ReactNode;
  index: number;
  media: Image;
  onTrack: (payload: EnlargedGalleryTrackingPayload) => void;
  root: Element | null;
  resolveTrackingPayload?: (media: Image, index: number) => EnlargedGalleryTrackingPayload;
  setNodeRef?: (node: HTMLDivElement | null) => void;
}

export function EnlargedMediaVisibilityTracker({
  active,
  children,
  index,
  media,
  onTrack,
  root,
  resolveTrackingPayload,
  setNodeRef,
}: EnlargedMediaVisibilityTrackerProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      setNodeRef?.(node);
    },
    [setNodeRef]
  );

  useEffect(() => {
    const node = elementRef.current;

    if (!active || !node || typeof IntersectionObserver === 'undefined') {
      clearTimer();
      return;
    }

    const trackingPayload = resolveTrackingPayload?.(media, index) ?? {
      assetPosition: index + 1,
      assetType: media.type ?? '',
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= ENLARGED_VIEWER_VISIBILITY_THRESHOLD) {
          clearTimer();
          timerRef.current = setTimeout(() => {
            onTrack(trackingPayload);
          }, ENLARGED_VIEWER_TRACKING_DELAY);
          return;
        }

        clearTimer();
      },
      {
        root,
        threshold: ENLARGED_VIEWER_VISIBILITY_THRESHOLD,
      }
    );

    observer.observe(node);

    return () => {
      clearTimer();
      observer.disconnect();
    };
  }, [active, clearTimer, index, media, onTrack, resolveTrackingPayload, root]);

  return (
    <Box ref={handleRef} data-testid={`enlarged-media-track-${index}`}>
      {children}
    </Box>
  );
}
