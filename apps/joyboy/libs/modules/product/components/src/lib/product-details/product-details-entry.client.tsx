'use client';

import {
  Product,
  selectHasWarrantyPlans,
  selectAssemblyAiData,
  selectProduct,
  selectVariant,
  selectVariantIds,
  selectWarrantyList,
  Variant,
  WarrantyOffer,
} from '@castlery/modules-product-domain';
import { getAssemblerInstructionCommand } from '@castlery/modules-product-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { sharedFeatureService } from '@castlery/shared-services';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductDetailsSectionKey } from '@castlery/types';
import { ProductDetailsDrawer } from './components/product-details-drawer';
import { ProductDetailsTrigger } from './components/product-details-trigger';

export const ProductDetailsEntryClient = () => {
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectProduct) as Product | undefined;
  const variant = (useAppSelector(selectVariant) as Variant | undefined) || product?.variants?.[0];
  const warrantyList = useAppSelector(selectWarrantyList) as WarrantyOffer[] | undefined;
  const currentVariantIds = useAppSelector(selectVariantIds);
  const hasWarrantyPlans = useAppSelector(selectHasWarrantyPlans);
  // [保险接入] Details Drawer 展示 warranty 区块时区分 provider（plan 数据来源见 warranty slice）
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const isMulberryEnabled = sharedFeatureService.isMulberryEnabled();
  const warrantyProvider = isGuardsmanEnabled ? 'guardsman' : isMulberryEnabled ? 'mulberry' : undefined;

  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [detailsInitialSection, setDetailsInitialSection] = useState<ProductDetailsSectionKey>('dimensions');

  const assemblyAiData = useAppSelector(selectAssemblyAiData);

  useEffect(() => {
    dispatch(getAssemblerInstructionCommand());
  }, [currentVariantIds, dispatch]);

  // TODO: phase 1 with hardcode text，therefore showAssembly is true
  // const showAssembly = useMemo(() => {
  //   return !!(assemblyAiData?.aiDocs?.length || assemblyAiData?.aiVideos?.length);
  // }, [assemblyAiData]);

  const showComfort = useMemo(() => {
    return (
      (variant?.variant_properties?.comfort_ratings?.length || 0) > 0 ||
      (product?.product_properties?.comfort_ratings?.length || 0) > 0
    );
  }, [variant, product]);

  const openDetailsDrawer = useCallback((section: ProductDetailsSectionKey) => {
    setDetailsInitialSection(section);
    setDetailsDrawerOpen(true);
  }, []);

  return (
    <>
      <ProductDetailsTrigger onOpen={openDetailsDrawer} showAssembly={true} showComfort={showComfort} />
      <ProductDetailsDrawer
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        initialSection={detailsInitialSection}
        product={product}
        variant={variant}
        warrantyList={warrantyList}
        hasWarrantyPlans={hasWarrantyPlans}
        warrantyProvider={warrantyProvider}
        showAssembly={true}
        showComfort={showComfort}
        assemblyAiData={assemblyAiData}
      />
    </>
  );
};
