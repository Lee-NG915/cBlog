'use client';

import React, { useMemo } from 'react';
import { HotspotsV2, TipsV2 } from '@castlery/modules-cms-domain';
import TheLook from '../../shop-the-look/components/theLook';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';

interface ShopTheLookItemProps {
  blok: {
    image: string;
    hotspots: HotspotsV2[];
    tips: TipsV2[];
    _uid: string;
  };
  showViewAllProducts: boolean;
  onDrawerStateChange?: (isOpen: boolean) => void;
}

const ShopTheLookItem = ({ blok, showViewAllProducts, onDrawerStateChange }: ShopTheLookItemProps) => {
  const { image, hotspots, tips, _uid } = blok;
  const variantIds = useMemo(() => {
    return hotspots.map((hotspot) => hotspot.variant_id).join(',');
  }, [hotspots]);
  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="shop-the-look-item" uid={_uid} key={_uid}>
      <TheLook
        hotsPotsBlok={hotspots}
        imageUrl={image}
        tipsBlok={tips}
        lookId={_uid}
        variantIds={variantIds}
        hideControl={!showViewAllProducts}
        hideAddToWishlist={true}
        onDrawerStateChange={onDrawerStateChange}
      />
    </DtStack>
  );
};

export { ShopTheLookItem };
