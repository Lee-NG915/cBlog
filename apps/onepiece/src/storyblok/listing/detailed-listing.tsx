import React, { useRef } from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { Container, Stack } from '@castlery/fortress';
import { useSelector } from 'react-redux';
import { DetailedProductComponent } from './detailed-product-listing';
import { useAnchorScroll } from '../hooks/anchor';

export type DetailedListingProps = {
  blok: {
    _uid?: string;
    items?: Array<{
      _uid: string;
      size?: 'large' | 'small';
      component?: string;
      product_id?: string | number;
    }>;
    anchor_link?: string;
  };
};

const DetailedListing = ({ blok }: DetailedListingProps) => {
  const { _uid, items = [], anchor_link } = blok;
  const { data: products, loading } = useSelector((state) => state.storyblokProductListing?.[_uid]) || {};

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  if (items.length === 0 || loading) {
    return null;
  }

  return (
    <Container>
      <Stack
        {...storyblokEditable(blok)}
        key={_uid}
        ref={blokRef}
        id={anchor_link?.slice(1)}
        direction="row"
        flexWrap="wrap"
      >
        {items.map((nestedBlok, index) => {
          let productInfo = {};

          if (nestedBlok.component === 'detailed-product-listing') {
            productInfo = products?.find((item) => Number(item.id) === Number(nestedBlok?.product_id)) || {};
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
                [theme.breakpoints.only('xs')]: {
                  flex: `0 0 ${nestedBlok.component === 'text-listing' ? '100%' : '50%'}`,
                },
              })}
            >
              {nestedBlok.component === 'detailed-product-listing' ? (
                <DetailedProductComponent blok={nestedBlok} productInfo={productInfo} />
              ) : (
                <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Container>
  );
};

export { DetailedListing };
