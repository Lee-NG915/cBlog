'use client';

import React, { useRef } from 'react';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { Container, Stack } from '@castlery/fortress';
import { SimpleProductComponent } from './simple-product-listing';
import { useAnchorScroll } from '../hook/anchor';
import { DtStack } from '@castlery/modules-tracking-components';
import { SimpleListingStoryblok } from '@castlery/types';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCMSProductList } from '@castlery/modules-cms-domain';

const SimpleListing = ({ blok }: { blok: SimpleListingStoryblok }) => {
  const { _uid, items = [], anchor_link } = blok;
  const products = useAppSelector(selectCMSProductList);

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
        componentName="simple-listing"
        uid={_uid}
        key={_uid}
        ref={blokRef}
        id={anchor_link?.slice(1)}
        direction="row"
        flexWrap="wrap"
      >
        {items.map((nestedBlok, index) => {
          let productInfo;
          if (nestedBlok.component === 'simple-product-listing') {
            productInfo = products?.[nestedBlok?.product_id];
          }

          return (
            <Stack
              key={index}
              sx={(theme) => ({
                flex: `0 0 ${nestedBlok.size === 'large' ? '50%' : '25%'}`,
                width: `${nestedBlok.size === 'large' ? '50%' : '25%'}`,
                '> div': {
                  width: '100%',
                  height: '100%',
                },
                [theme.breakpoints.between('xs', 'lg')]: {
                  flex: `0 0 ${nestedBlok.component === 'text-listing' ? '100%' : '50%'}`,
                },
              })}
            >
              {nestedBlok.component === 'simple-product-listing' ? (
                <SimpleProductComponent blok={nestedBlok} productInfo={productInfo || {}} />
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

export { SimpleListing };
