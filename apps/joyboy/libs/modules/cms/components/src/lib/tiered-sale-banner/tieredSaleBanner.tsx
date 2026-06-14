'use client';

import { useEffect, useRef, useState } from 'react';
import { Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useBreakpoints } from '@castlery/fortress';
import { TieredItem, TieredItemProps } from './tiered-item';
import { useAnchorScroll } from '../../hooks';

// type DividerProps = {
//   divider_colour?: { color: string };
//   dividerColour?: { color: string };
// };

// const Divider = ({ divider_colour, dividerColour }: DividerProps) => (
//   <Box
//     sx={(theme) => ({
//       backgroundColor: divider_colour?.color || dividerColour?.color || theme.palette.brand.terracotta[500],
//       minWidth: 2,
//     })}
//   />
// );

type TieredSaleBannerProps = {
  blok: {
    _uid?: string;
    tiered_item_group?: TieredItemProps[];
    divider_colour?: { color: string };
    tier_colour?: { color: string };
    tieredItemGroup?: TieredItemProps[];
    dividerColour?: { color: string };
    tierColour?: { color: string };
    anchor_link?: string;
  };
};

const TieredSaleBanner = ({ blok }: TieredSaleBannerProps) => {
  const {
    _uid,
    tiered_item_group,
    divider_colour,
    tier_colour,
    tieredItemGroup,
    dividerColour,
    tierColour,
    anchor_link,
  } = blok;
  const { mobile, tablet } = useBreakpoints();
  const blokRef = useRef<HTMLDivElement>(null);
  const borderColor = divider_colour?.color || dividerColour?.color;
  const itemsLength = (tiered_item_group || tieredItemGroup).length;
  const [outerHeight, setOuterHeight] = useState<number | undefined>();
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link || '',
  });
  useEffect(() => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    if (blokRef?.current?.children[0]?.children && Array.isArray([...blokRef?.current?.children[0]?.children])) {
      let maxHeight = 0;
      // eslint-disable-next-line no-unsafe-optional-chaining
      [...blokRef?.current?.children[0]?.children].forEach((item) => {
        if (item.clientHeight > maxHeight) {
          maxHeight = item.clientHeight;
        }
      });
      if (tablet || mobile) {
        maxHeight = Math.min(46, maxHeight);
      }
      if (!tablet && !mobile) {
        maxHeight = Math.min(maxHeight, 91);
      }
      setOuterHeight(maxHeight);
    }
  }, [blokRef, mobile, tablet]);

  const calcOutHeight = () => {
    if (mobile) {
      if (itemsLength === 4) {
        return 140;
      }
      return 80;
    }
    if (tablet) {
      return 80;
    }
    return 107;
  };

  return (
    <Stack
      justifyContent="center"
      direction="row"
      sx={() => ({
        width: '100%',
        backgroundColor: tier_colour?.color || tierColour?.color,
        justifyContent: 'center',
        height: calcOutHeight(),
      })}
      id={`#${anchor_link?.split('#')[1]}`}
      ref={blokRef}
    >
      <Stack
        {...storyblokEditable(blok)}
        key={_uid}
        direction="row"
        flexWrap={mobile && itemsLength === 4 ? 'wrap' : null}
        sx={() => ({
          paddingTop: '8px',
          paddingBottom: '8px',
          maxWidth: mobile ? '22.375rem' : tablet ? '38rem' : '57.5rem',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
        {(tiered_item_group || tieredItemGroup).map((item, index) => {
          if (!mobile) {
            if (index === 0) {
              return (
                <TieredItem
                  {...item}
                  key={item._uid}
                  borderColor={borderColor}
                  borderType="right"
                  mobileWidth={itemsLength === 3 ? '7.5rem' : '11rem'}
                  itemJustifyContent="center"
                  outerHeight={outerHeight}
                  // stickyToRight
                />
              );
            }
            if (index === 1 && (itemsLength === 3 || itemsLength === 4)) {
              return (
                <TieredItem
                  {...item}
                  key={item._uid}
                  borderColor={borderColor}
                  borderType="right"
                  mobileWidth={itemsLength === 3 ? '7.5rem' : '11rem'}
                  itemJustifyContent="center"
                  outerHeight={outerHeight}
                />
              );
            }
            return (
              <TieredItem
                {...item}
                key={item._uid}
                borderColor={borderColor}
                borderType={index === itemsLength - 1 ? undefined : 'right'}
                mobileWidth={itemsLength === 3 ? '7.5rem' : '11rem'}
                itemJustifyContent="center"
                outerHeight={outerHeight}
              />
            );
          }
          if (itemsLength === 4) {
            if (index < itemsLength && index % 2 !== 1) {
              return (
                <TieredItem
                  {...item}
                  key={item._uid}
                  borderColor={borderColor}
                  borderType="right"
                  needMargin={index === itemsLength - 2}
                  mobileWidth="11rem"
                  itemJustifyContent={mobile && itemsLength === 4 ? 'center' : undefined}
                  stickyToRight
                  outerHeight={outerHeight}
                />
              );
            }
          } else {
            if (index === 0) {
              return (
                <TieredItem
                  {...item}
                  key={item._uid}
                  borderColor={borderColor}
                  borderType="right"
                  mobileWidth={itemsLength === 3 ? '7.5rem' : '11rem'}
                  itemJustifyContent={mobile && itemsLength === 2 ? 'center' : undefined}
                  outerHeight={outerHeight}
                />
              );
            }
            if (index === 1 && itemsLength === 3) {
              return (
                <TieredItem
                  {...item}
                  key={item._uid}
                  borderColor={borderColor}
                  borderType="right"
                  mobileWidth={itemsLength === 3 ? '7.5rem' : '11rem'}
                  itemJustifyContent="center"
                  outerHeight={outerHeight}
                />
              );
            }
            return (
              <TieredItem
                {...item}
                key={item._uid}
                borderColor={borderColor}
                borderType={index < itemsLength - 1 ? 'right' : null}
                mobileWidth={itemsLength === 3 ? '7.5rem' : '11rem'}
                itemJustifyContent={mobile && itemsLength === 2 ? 'center' : undefined}
                outerHeight={outerHeight}
              />
            );
          }
          return (
            <TieredItem
              {...item}
              key={item._uid}
              needMargin={mobile && itemsLength === 4 && index === itemsLength - 1}
              mobileWidth={itemsLength === 3 ? '7.5rem' : '11rem'}
              itemJustifyContent={mobile && itemsLength === 4 ? 'center' : undefined}
              outerHeight={outerHeight}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};

export { TieredSaleBanner };
