'use client';
import {
  useBreakpoints,
  Tabs,
  Tab,
  TabList,
  tabClasses,
  Stack,
  Typography,
  buttonClasses,
  Button,
} from '@castlery/fortress';
import { useRef, useCallback, useMemo, useEffect } from 'react';
import { selectProduct, type Product } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useAsyncFn, useWindowScroll, useWindowSize } from 'react-use';
import { storyblokEditable } from '@storyblok/react/rsc';
import {
  // useParams,
  usePathname,
} from 'next/navigation';
import { createDataTrackingData } from '@castlery/utils';
import { useScrollObserver } from '@castlery/shared-components';
import { StickyBarModuleName } from './config';
import { DtStack } from '@castlery/modules-tracking-components';
import { WebAddToCart, usePhAtcProperities } from '@castlery/modules-product-components';
import { StickyBarV2Storyblok } from '@castlery/types';
import { OnlineAddCartSource } from '@castlery/config';
import { addToCartCommandV2 } from '@castlery/modules-cart-services';

export const sectionClassSelectorName = 'story_section';

/**
 * https://dollarshaveclub.github.io/stickybits/
 */

function StickyBarContent({ blok }: { blok: StickyBarV2Storyblok }) {
  const navBarIdSelectorName = `${blok.component}_${blok._uid}`;

  const sectionClassSelector = `.${sectionClassSelectorName}`;

  const pathname = usePathname();
  // const { region } = useParams();
  const scrollRef = useRef(null);
  const stickyRef = useRef(null);
  const { y: scrollY } = useWindowScroll();
  const { height: viewHeight } = useWindowSize();
  const documentHeight = typeof document === 'undefined' ? 0 : document?.documentElement?.scrollHeight;
  const dispatch = useAppDispatch();

  const { bar_items = [], button } = blok || {};
  const { desktop, tablet } = useBreakpoints();

  const product = useAppSelector(selectProduct) as Product;
  const showBar = useMemo(() => {
    return scrollY > viewHeight && documentHeight - viewHeight > scrollY;
  }, [scrollY, viewHeight, documentHeight]);

  const phProps = usePhAtcProperities();

  const navLinks = useScrollObserver({
    navBarIdSelector: `#${navBarIdSelectorName}`,
    sectionClassSelector,
  });

  const trackingProps = useCallback(
    (navItemName: string) =>
      createDataTrackingData({
        module: StickyBarModuleName,
        pathname,
        elementName: navItemName,
      }),
    [pathname]
  );

  useEffect(() => {
    const ele = stickyRef.current;
    if (ele) {
      // 处理window.reload时，sticky bar不显示的问题
      ele.style.display = showBar ? 'block' : 'none';
    }
  }, [stickyRef, showBar]);

  const [addToCartState, addToOrder] = useAsyncFn(async () => {
    try {
      return await dispatch(addToCartCommandV2({ scene: 'pdp-web', source: OnlineAddCartSource.PLA })).unwrap();
    } catch (error: Error | any) {
      console.log('🚀 ~ const[{loading:ATCLoading},addToOrder]=useAsyncFn ~ error:', error);
      return null;
    }
  });

  return (
    // staicky 元素外层，一定是相对位置具有滚动属性的元素，否则sticky不生效
    <Stack
      {...storyblokEditable(blok)}
      key={blok._uid}
      ref={stickyRef}
      direction={'row'}
      sx={{
        boxShadow: '0px 0px 25px -4px rgba(34, 34, 34, 0.16)',
        background: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        margin: 'auto',
        display: showBar ? 'block' : 'none',
        zIndex: 1299,
      }}
    >
      <DtStack
        useImpression
        uid={blok._uid}
        componentName={StickyBarModuleName}
        sx={{
          maxWidth: desktop ? 1728 : 'auto',
          margin: 'auto',
          overflow: 'hidden',
          gap: 2,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(desktop || tablet
            ? {
                px: 3,
                py: 2,
              }
            : {
                pt: '20px',
              }),
          [`& .${buttonClasses.root}`]: {
            minWidth: 120,
            maxWidth: 166,
          },
        }}
      >
        {desktop && (
          <Typography
            level="subh1"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 200,
              maxWidth: 300,
            }}
          >
            {product?.name}
          </Typography>
        )}
        <Tabs aria-label="Stciky Scrollable tabs">
          <TabList
            id={navBarIdSelectorName}
            ref={scrollRef}
            disableUnderline
            sx={(theme) => {
              return {
                width: !desktop ? '100vw' : '100%',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { display: 'none' },

                ...(desktop || tablet
                  ? {
                      [`& .${tabClasses.root}`]: {
                        py: 0,
                        px: 2,
                        color: (theme) => theme.palette.text.primary,
                        borderRadius: '40px',
                        [`&:not(.Mui-selected, [aria-selected="true"]):hover`]: {
                          background: (theme) => theme.palette.brand.wheat[200],
                          color: '#FFF',
                        },
                      },

                      [`& .${tabClasses.root}[aria-selected="true"]`]: {
                        backgroundColor: theme.palette.neutral[500],
                        color: '#FFF',
                      },
                    }
                  : {
                      [`& .${tabClasses.root}`]: {
                        color: (theme) => theme.palette.text.primary,
                      },
                      [`& .${tabClasses.root}[aria-selected="true"]`]: {
                        color: (theme) => theme.palette.text.primary,
                        '&::after': {
                          background: (theme) => theme.palette.neutral[500],
                          height: 4,
                        },
                      },
                      [`& .${tabClasses.root}:not(.Mui-selected, [aria-selected="true"]):hover`]: {
                        color: (theme) => theme.palette.text.primary,
                      },
                    }),
              };
            }}
          >
            {bar_items.map((item, index) => (
              <Tab
                {...trackingProps(item.title)}
                component={'a'}
                disableIndicator={desktop || tablet}
                indicatorInset
                indicatorPlacement="bottom"
                action={(el) => (navLinks.current[index] = el)}
                href={`#${item.anchor_id}`}
                level="body2"
                sx={{
                  cursor: 'pointer',
                  flex: 'none',
                  scrollSnapAlign: 'start',
                  color: 'inherit',
                }}
              >
                {item.title}
              </Tab>
            ))}
          </TabList>
        </Tabs>
        {desktop && (
          // <WebAddToCart
          //   isCmsComponent={true}
          //   buttonSlot={
          //     <CmsButton
          //       sx={{
          //         display: 'flex',
          //         flexDirection: 'column',
          //         alignItems: 'stretch',
          //         justifyContent: 'center',
          //       }}
          //       outerModuleName={StickyBarModuleName}
          //       blok={{
          //         ...(button?.[0] || {}),
          //       }}
          //       {...phProps}
          //     />
          //   }
          // />
          <Button loading={addToCartState.loading} onClick={addToOrder}>
            Add to New Cart{' '}
          </Button>
        )}
      </DtStack>
    </Stack>
  );
}

export function StickyBar({ blok }: { blok: StickyBarV2Storyblok }) {
  const { visibility = [] } = blok;
  const { show = ['all'] } = visibility[0] || {};
  const { desktop, mobile, tablet } = useBreakpoints();
  const shouldShow =
    show.includes('all') ||
    (desktop && show.includes('desktop')) ||
    (mobile && show.includes('mobile')) ||
    (tablet && show.includes('tablet'));

  if (!shouldShow) {
    return null;
  }

  return <StickyBarContent blok={blok} />;
}
export default StickyBar;
