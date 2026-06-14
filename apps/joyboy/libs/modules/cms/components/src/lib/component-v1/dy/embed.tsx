'use client';

import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { deepClone } from '@castlery/modules-product-components';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAnchorScroll } from '../hook/anchor';
import { DYProductList } from './dy-product-list';
import type { DYProduct } from './types';

export type DYEmbedProps = {
  blok: {
    _uid?: string;
    selector_name?: string;
    anchor_link?: string;
  };
};

const DYEmbed = ({ blok }: DYEmbedProps) => {
  const { _uid, selector_name, anchor_link } = blok;

  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';

  const [filterProducts, setFilterProducts] = useState<DYProduct[]>([]);

  const [listInfo, setListInfo] = useState<{
    title: string;
    link: string;
    linkText: string;
    needShowLifeImage: boolean;
  }>({});

  const campaign = useGetDyCampaignsQuery(
    {
      campaignNames: [selector_name || ''],

      query: { dyApiPreview },
    },
    { skip: !selector_name }
  );

  const recommendationInfo = campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data;

  useEffect(() => {
    if (recommendationInfo) {
      if (recommendationInfo?.custom) {
        let link = '';
        let linkText = '';
        const title = recommendationInfo?.custom?.title;
        const needShowLifeImage = recommendationInfo?.custom?.imageType === '1';
        if (recommendationInfo?.custom?.recommendationLink && recommendationInfo?.custom?.recommendationLinkText) {
          link = recommendationInfo?.custom?.recommendationLink;
          linkText = recommendationInfo?.custom?.recommendationLinkText;
        }
        setListInfo({
          title,
          link,
          linkText,
          needShowLifeImage,
        });
      }
      const groupIds: string[] = [];
      let tempProducts: DYProduct[] = [];
      recommendationInfo?.slots?.forEach((item: DYProduct) => {
        let { productData } = item;
        productData = deepClone(productData);
        if (productData?.badges) {
          if (productData?.badges.indexOf(',') > -1) {
            const tempArr: string[] = [];
            productData?.badges?.split(',').forEach((badge) => {
              tempArr.push(badge.trim());
            });
            productData.badgesArr = tempArr;
          } else {
            productData.badgesArr = [productData.badges];
          }
        }
        if (!groupIds.includes(productData.group_id)) {
          groupIds.push(productData.group_id);
          tempProducts.push({
            sku: item.sku,
            productData,
            slotId: item.slotId,
          });
        }
      });
      let productsLength = 50;
      try {
        if (typeof Number(recommendationInfo?.custom?.recommendationLength) === 'number') {
          productsLength = Number(recommendationInfo?.custom?.recommendationLength);
        }
      } catch (e) {
        console.log('recommendationLength configuration illegal');
      }
      tempProducts = tempProducts.slice(0, productsLength);
      setFilterProducts(tempProducts);
    }
  }, [recommendationInfo]);

  const blokRef = useRef(null);

  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  if (filterProducts.length > 0) {
    return (
      <DtStack
        useImpression
        {...storyblokEditable(blok)}
        key={_uid}
        uid={_uid}
        componentName="dy-embed"
        ref={blokRef}
        id={anchor_link?.slice(1)}
      >
        <DYProductList outerModuleName={selector_name} products={filterProducts} listInfo={listInfo} />
      </DtStack>
    );
  }

  return null;
};

export { DYEmbed };
