'use client';

import { Box } from '@castlery/fortress';
import { Image } from '@castlery/modules-product-domain';
import { useFirstInView } from '@castlery/modules-tracking-components';
import { type SxProps, type Theme } from '@mui/joy';
import { type PropsWithChildren } from 'react';

export interface DesktopGalleryImpressionPayload {
  assetPosition: number;
  assetType: string;
}

interface DesktopGalleryImpressionTrackerProps {
  index: number;
  media: Image;
  onImpression: (payload: DesktopGalleryImpressionPayload) => void;
  sx?: SxProps<Theme>;
}

export function DesktopGalleryImpressionTracker({
  children,
  index,
  media,
  onImpression,
  sx,
}: PropsWithChildren<DesktopGalleryImpressionTrackerProps>) {
  const impressionRef = useFirstInView(() => {
    onImpression({
      assetPosition: index + 1,
      assetType: media.type,
    });
  });

  return (
    <Box ref={impressionRef as any} data-testid={`desktop-impression-tile-${index}`} sx={sx}>
      {children}
    </Box>
  );
}
