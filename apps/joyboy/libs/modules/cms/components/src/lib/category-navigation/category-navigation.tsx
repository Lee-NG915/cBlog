'use client';
import { Stack, Card, List, ListItem, Typography, useBreakpoints, cardClasses, Button } from '@castlery/fortress';
import { CmsText } from '../cms-text/cms-text';
import { FortressImage, ScrollWrapper } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct, type Product } from '@castlery/modules-product-domain';
import { selectCMSOriginalMenuData } from '@castlery/modules-cms-domain';
import { useParams, usePathname } from 'next/navigation';
import { EcEnv } from '@castlery/config';
import { storyblokEditable } from '@storyblok/react/rsc';
import {
  DtStack,
  // useTrackingTags
} from '@castlery/modules-tracking-components';
import { CategoryNavigationModuleName } from './config';
import { createDataTrackingData } from '@castlery/utils';
import { CategoryNavigationV2Storyblok } from '@castlery/types';

//todo: 抽到slice中，并添加到redux中 @abby
export const getProductBreadcrumbs = (categoryLevels) => {
  if (!Array.isArray(categoryLevels)) {
    return [];
  }
  const firstLevel = categoryLevels.find((t) => t.level === 1);
  const secondLevel = categoryLevels.find((t) => t.level === 2);
  const firstPage = firstLevel?.permalink;
  const secondPage = secondLevel?.permalink;
  if (firstPage && secondPage) {
    return [firstPage, secondPage];
  }
  return [];
};
//todo: 抽到slice中，并添加到redux中
const useAncestorCrumbs = () => {
  const product = useAppSelector(selectProduct) as Product;
  const menu = useAppSelector(selectCMSOriginalMenuData);
  const ancestorCrumbs = getProductBreadcrumbs(product?.breadcrumbs);
  const page = ancestorCrumbs?.[0] ? ancestorCrumbs?.[0] : null;
  const target = menu?.children?.find((item) => item.permalink === page) || {};
  const { children: targetChilds, ...rest } = target;
  let links = [{ ...rest, name: `All ${target.name}` }, ...(targetChilds || [])];
  if (links.length !== 0) {
    links = links?.filter((i) => !i.permalink?.includes('all')).slice(0, 6);
  }
  return { links };
};
interface CategoryNavigationProps {
  blok: CategoryNavigationV2Storyblok;
}

export function CategoryNavigation({ blok }: CategoryNavigationProps) {
  const { desktop, tablet } = useBreakpoints();
  const { title, description } = blok;
  const { links } = useAncestorCrumbs();
  const { region } = useParams();
  const pathname = usePathname();
  if (links.length === 0) {
    return null;
  }

  const trackingTags = (productName: string) =>
    createDataTrackingData({
      pathname,
      module: CategoryNavigationModuleName,
      elementName: productName,
    });

  return (
    <DtStack
      useImpression
      uid={blok?._uid}
      componentName={CategoryNavigationModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      sx={{
        py: desktop ? '60px' : tablet ? 6 : 4,
        px: desktop ? 4 : 3,
      }}
    >
      <Stack gap={1}>
        <CmsText blok={title[0]} />
        <CmsText blok={description[0]} />
      </Stack>
      <ScrollWrapper hideDesktopAction stepLength={desktop ? 536 * 3 : tablet ? 300 * 2 : 308}>
        <List orientation="horizontal" sx={{ gap: desktop ? 4 : 2, m: 0, p: 0 }}>
          {links.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                m: 0,
                p: 0,
                [`& .${cardClasses.root}`]: {
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: 'none',
                  background: 'transparent',
                },
              }}
            >
              <Card
                sx={{
                  p: 0,
                  gap: 0,
                  ...(desktop
                    ? {
                        width: '30.1vw',
                        maxWidth: 520,
                      }
                    : { width: 292 }),
                }}
              >
                <FortressImage src={item.thumbnail} alt={item.name} ratio={desktop ? 520 / 345 : 292 / 192} />
                <Button
                  {...trackingTags(item?.name)}
                  component="a"
                  variant="solid"
                  color="neutral"
                  sx={{ height: desktop ? '4.6vw' : 48, maxHeight: desktop ? 80 : 48, px: 0 }}
                  href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${region}${item.url}`}
                >
                  <Typography
                    color="inherit"
                    sx={{
                      fontSize: desktop ? 28 : 18,
                      fontFamily: `var(--fortress-fontFamily-display)`,
                      p: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </Typography>
                </Button>
              </Card>
            </ListItem>
          ))}
        </List>
      </ScrollWrapper>
    </DtStack>
  );
}

export default CategoryNavigation;
