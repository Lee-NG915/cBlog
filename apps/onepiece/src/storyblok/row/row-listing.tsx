import React, { useRef } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { Stack, Box, Container } from '@castlery/fortress';
import ResponsiveSlick from 'components/ResponsiveSlick';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { RowItem } from './row-item';
import { useAnchorScroll } from '../hooks/anchor';
import { hasRichText } from '../tool';

export type RowListingProps = {
  blok: {
    _uid?: string;
    items?: Array<{
      _uid: string;
      image: [];
      video: [];
      header?: string;
      sub_header?: string;
      description?: string;
    }>;
    with_divider?: boolean;
    anchor_link?: string;
  };
};

const RowListing = ({ blok }: RowListingProps) => {
  const { desktop } = useBreakpoints();
  const { _uid, items = [], with_divider, anchor_link } = blok;
  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });
  const imgRatio = [0.6223, 0.2222, 0.4752];
  const perRow = 3;
  const filterItems = items.filter(
    (item) =>
      item.image.length > 0 ||
      item.video.length > 0 ||
      item.header ||
      hasRichText(item.sub_header) ||
      hasRichText(item.description)
  );

  if (filterItems.length === 0) {
    return null;
  }

  if (filterItems.length <= perRow && desktop) {
    return (
      <Container>
        <Stack
          {...storyblokEditable(blok)}
          key={_uid}
          ref={blokRef}
          id={anchor_link?.slice(1)}
          direction="row"
          justifyContent="space-between"
          divider={
            <Box
              component="hr"
              sx={(theme) => ({
                border: with_divider ? `0.5px solid ${theme.palette.brand.charcoal[800]}` : 'none',
                my: theme.spacing(6),
                mx: with_divider ? theme.spacing(7) : theme.spacing(3.5),
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
              <RowItem blok={nestedBlok} key={nestedBlok._uid} ratio={imgRatio[filterItems.length % perRow]} />
            </Stack>
          ))}
        </Stack>
      </Container>
    );
  }

  return (
    <Container disableGutters>
      <Stack
        {...storyblokEditable(blok)}
        key={_uid}
        ref={blokRef}
        id={anchor_link?.slice(1)}
        sx={(theme) => ({
          [theme.breakpoints.only('xs')]: {
            width: '100%',
          },
        })}
      >
        <ResponsiveSlick
          mediaQueries={[
            {
              query: '(min-width: 0)',
              numPerPage: !desktop ? 1 : perRow,
            },
          ]}
          offset={0.12}
        >
          {filterItems.map((nestedBlok, index) => (
            <Stack
              key={index}
              direction="row"
              sx={(theme) => ({
                position: 'relative',
                px: theme.spacing(with_divider ? 7 : 3.5),
                alignSelf: 'stretch',
                [theme.breakpoints.only('xs')]: {
                  px: theme.spacing(with_divider ? 4 : 2),
                  ':first-child': {
                    pl: theme.spacing(2),
                  },
                  ':last-child': {
                    pr: theme.spacing(2),
                  },
                },
                '::before': with_divider &&
                  ((!desktop && index > 0) || index % perRow > 0) && {
                    content: '""',
                    position: 'absolute',
                    top: theme.spacing(6),
                    left: 0,
                    width: '1px',
                    height: `calc(100% - ${theme.spacing(12)})`,
                    backgroundColor: theme.palette.brand.charcoal[800],
                  },
              })}
            >
              <RowItem blok={nestedBlok} key={nestedBlok._uid} />
            </Stack>
          ))}
        </ResponsiveSlick>
      </Stack>
    </Container>
  );
};

export { RowListing };
