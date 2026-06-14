'use client';

import React, { useRef } from 'react';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { Container, Stack, useBreakpoints } from '@castlery/fortress';
import { DetailedProductComponent } from './detailed-product-listing';
import { useAnchorScroll } from '../hook/anchor';
import { DtStack } from '@castlery/modules-tracking-components';
import { DetailedListingStoryblok } from '@castlery/modules-cms-services';
import { selectCMSProductList } from '@castlery/modules-cms-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

export type DetailedListingProps = {
  blok: DetailedListingStoryblok;
};
const DetailedListing = ({ blok }: DetailedListingProps) => {
  const { _uid, items = [], anchor_link } = blok;
  const products = useAppSelector(selectCMSProductList);
  const { desktop } = useBreakpoints();

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  if (!products) return;

  return (
    <Container>
      <DtStack
        useImpression
        {...storyblokEditable(blok)}
        componentName="detailed-listing"
        uid={_uid}
        key={_uid}
        ref={blokRef}
        id={anchor_link?.slice(1)}
        direction="row"
        flexWrap="wrap"
        sx={{
          flexDirection: desktop ? 'row' : 'column',
        }}
      >
        {items.map((nestedBlok, index) => {
          let productInfo = {};

          if (nestedBlok.component === 'detailed-product-listing') {
            productInfo = products?.[nestedBlok?.product_id];
          }

          return (
            <Stack
              key={index}
              sx={(theme) => ({
                flex: desktop ? `0 0 ${nestedBlok.size === 'large' ? '50%' : '25%'}` : ' 0 0 100%',
                width: desktop ? `${nestedBlok.size === 'large' ? '50%' : '25%'}` : '100%',
                '> div': {
                  width: '100%',
                  height: '100%',
                },
                [theme.breakpoints.only('xs')]: {
                  flex: `0 0 ${nestedBlok.component === 'text-listing' ? '100%' : '50%'}`,
                },
              })}
            >
              {nestedBlok.component === 'detailed-product-listing' ? (
                <DetailedProductComponent blok={nestedBlok} productInfo={productInfo} />
              ) : (
                <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
              )}
            </Stack>
          );
        })}
      </DtStack>
    </Container>
  );
};

export { DetailedListing };
