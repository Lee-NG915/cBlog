'use client';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { TipsV2 } from '@castlery/modules-cms-domain';
import { TipsAndUpdates } from '@castlery/fortress/Icons';
import { Box, Card, Typography } from '@castlery/fortress';
import React, { useState, useEffect } from 'react';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { ShopTheLookModuleName } from '../config';
import Spot from './spot';
type PopPosition = 'above' | 'below' | 'left' | 'right';
export interface TipsProps {
  tips: TipsV2;
  viewState: boolean;
  mobileClickHandler: () => void;
}
export default function Tip({ tips, viewState, mobileClickHandler }: TipsProps) {
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;
  const { x, y, popup, title, description } = tips;
  const popupPosition: PopPosition = popup as PopPosition;
  const [popupIsActive, setPopupIsActive] = useState(viewState && !isMobile);

  const trackingTags = useTrackingTags({
    moduleName: ShopTheLookModuleName,
    elementName: 'Hotspot',
    content: {
      target: title,
    },
  });

  const showUpPosition: Record<PopPosition, { [key: string]: string }> = {
    above: { bottom: '100%' },
    below: { top: '100%' },
    left: { right: '100%' },
    right: { left: '100%' },
  };
  let popUpAttributes = {};
  if (isMobile) {
    popUpAttributes = {
      onClick: mobileClickHandler,
    };
  } else {
    popUpAttributes = {
      onMouseOver: () => {
        setPopupIsActive(true);
      },
      onMouseLeave: () => {
        if (!viewState) {
          setPopupIsActive(false);
        }
      },
    };
  }
  useEffect(() => {
    setPopupIsActive(viewState && !isMobile);
  }, [viewState, isMobile]);
  return (
    <>
      <Box
        sx={{
          gridColumn: `${x}/${+x + 1}`,
          gridRow: `${y}/${+y + 1}`,
        }}
        {...popUpAttributes}
      >
        <Spot
          stopAnimation={popupIsActive}
          centerDotBgColor={'var(--fortress-palette-brand-terracotta-200)'}
          {...trackingTags}
        >
          <Card
            variant="outlined"
            sx={{
              zIndex: '2',
              flex: '0 0 300px',
              width: '375px',
              minHeight: '100px',
              padding: '10px 15px',
              position: 'absolute',
              backgroundColor: 'white',
              borderRadius: '8px',
              display: popupIsActive ? 'block' : 'none',
              ...showUpPosition[popupPosition],
            }}
          >
            <Box display="flex" alignItems="center">
              <TipsAndUpdates />
              <Typography
                level="h4"
                sx={{
                  marginLeft: '12px',
                  color: '#686666',
                }}
              >
                {title}
              </Typography>
            </Box>
            <Typography level="caption2">{description}</Typography>
          </Card>
        </Spot>
      </Box>
    </>
  );
}
