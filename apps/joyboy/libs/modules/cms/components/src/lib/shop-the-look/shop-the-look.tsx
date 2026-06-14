'use client';
import { Content } from './content';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import type { HotspotsV2, TheLookComponentV2 } from '@castlery/modules-cms-domain';
import { getShopTheLookVariant } from '@castlery/modules-product-domain';
import { selectShopTheInfoData } from '@castlery/modules-cms-domain';
import { setupShopTheLookListeners } from '@castlery/modules-product-services';
import { useEffect, useState, useMemo } from 'react';
import { startAppListening } from '@castlery/shared-redux-store';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';
import { ShopTheLookModuleName } from './config';
import { ShopTheLookV2Storyblok, ShopTheLookDataV2Storyblok } from '@castlery/types';

export interface RuntimeShopTheLookV2Storyblok extends Omit<ShopTheLookV2Storyblok, 'data_source'> {
  data_source: ShopTheLookDataV2Storyblok[];
}

export function ShopTheLook({ blok }: { blok: RuntimeShopTheLookV2Storyblok }) {
  const { data_source } = blok;
  const dispatch = useAppDispatch();
  const _source = useMemo(() => (data_source && data_source[0]) || {}, [data_source]);
  const allShopTheLookContent = useAppSelector(selectShopTheInfoData);
  const [theLookData, setTheLookData] = useState<TheLookComponentV2 | undefined>(undefined);

  useEffect(() => {
    setupShopTheLookListeners(startAppListening);
  }, []);

  useEffect(() => {
    for (const key of Object.keys(allShopTheLookContent)) {
      if (Array.isArray(allShopTheLookContent[key])) {
        const res = allShopTheLookContent[key].find(
          (item) => item.collection_name === _source?.look_name || item.look_name === _source?.look_name
        );
        setTheLookData(res);
        if (res) return;
      }
    }
  }, [allShopTheLookContent, _source]);
  // const hotsPotVariantIdStr = theLookData?.hotspots?.map((hotspot: HotspotsV2) => hotspot.variant_id).join(',') || '';
  const hotsPotVariantIdStr = useMemo(() => {
    if (!theLookData?.hotspots?.length) return '';
    return theLookData.hotspots.map((hotspot) => hotspot.variant_id).join(',');
  }, [theLookData]);

  useEffect(() => {
    if (!hotsPotVariantIdStr) return;
    dispatch(getShopTheLookVariant.initiate(hotsPotVariantIdStr));
  }, [dispatch, hotsPotVariantIdStr]);
  if (!theLookData) return null;
  return (
    <DtStack
      useImpression
      uid={blok?._uid}
      componentName={ShopTheLookModuleName}
      {...storyblokEditable(blok)}
      key={blok?._uid}
    >
      <Content
        shopTheLook={blok as unknown as ShopTheLookV2Storyblok}
        theLookData={theLookData}
        sourceLink={_source.cta_link}
        variantIds={hotsPotVariantIdStr}
      />
    </DtStack>
  );
}
