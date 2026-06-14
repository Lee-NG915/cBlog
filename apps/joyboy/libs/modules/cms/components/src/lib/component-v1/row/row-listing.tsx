'use client';

import { Box, Container, Stack } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useRef } from 'react';
import { hasRichText } from '../../../utils/rich-text-utils';
import { useAnchorScroll } from '../hook/anchor';
import { RowItem } from './row-item';

export type RowListingProps = {
  blok: {
    _uid?: string;
    items?: Array<{
      _uid?: string;
      image: [];
      video: [];
      header?: string;
      sub_header?: string;
      description?: string;
    }>;
    anchor_link?: string;
    background_color?: string;
  };
};

const RowListing = ({ blok }: RowListingProps) => {
  const { desktop } = useBreakpoints();
  const { _uid, items = [], anchor_link, background_color } = blok;
  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });
  const imgRatio = [0.32, 0.65, 1];
  const perRow = 3;
  const filterItems = items.filter(
    (item) =>
      item.image.length > 0 ||
      item.video.length > 0 ||
      item.header ||
      hasRichText(item.sub_header) ||
      hasRichText(item.description)
  );

  if (filterItems.length === 0 || filterItems.length > perRow) {
    return null;
  }

  if (filterItems.length <= perRow && desktop) {
    return (
      <Container
        sx={(theme) => ({
          px: `32px !important`,
          // paddingTop: '60px',
          backgroundColor: background_color || theme.palette.brand.warmLinen[500],
          [theme.breakpoints.down('sm')]: {
            px: `12px !important`,
          },
        })}
      >
        <DtStack
          useImpression
          {...storyblokEditable(blok)}
          key={_uid}
          uid={_uid}
          componentName="row-listing"
          ref={blokRef}
          id={anchor_link?.slice(1)}
          direction="row"
          justifyContent="space-between"
          divider={
            <Box
              component="hr"
              sx={(theme) => ({
                border: 'none',
                my: '24px',
                mx: '20px',
              })}
            />
          }
        >
          {filterItems.map((nestedBlok, index) => (
            <Stack
              key={index}
              sx={{
                flex: 1,
              }}
            >
              <RowItem
                blok={nestedBlok}
                key={nestedBlok._uid}
                ratio={imgRatio[filterItems.length - 1]}
                sizes={[
                  '1-xs',
                  `${imgRatio[filterItems.length - 1]}-md`,
                  `${imgRatio[filterItems.length - 1]}-lg`,
                  `${imgRatio[filterItems.length - 1] * 0.8}-xl`,
                ]}
              />
            </Stack>
          ))}
        </DtStack>
      </Container>
    );
  }

  return (
    <Container
      sx={(theme) => ({
        px: `24px !important`,
        backgroundColor: background_color || theme.palette.brand.warmLinen[500],
      })}
    >
      <DtStack
        useImpression
        {...storyblokEditable(blok)}
        key={_uid}
        uid={_uid}
        componentName="row-listing"
        ref={blokRef}
        id={anchor_link?.slice(1)}
        direction="column"
        justifyContent="space-between"
      >
        {filterItems.map((nestedBlok, index) => (
          <Stack
            key={index}
            sx={{
              flex: 1,
            }}
          >
            <RowItem blok={nestedBlok} key={nestedBlok._uid} ratio={1} />
          </Stack>
        ))}
      </DtStack>
    </Container>
  );
};

export { RowListing };
