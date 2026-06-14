'use client';
import { Stack, useBreakpoints, List, ListItem } from '@castlery/fortress';
import type { BestsellersDefaultVariantV2 } from '../../types/product-bestsellers';
import { CmsText } from '../cms-text/cms-text';
import { CmsLink } from '../cms-link/cms-link';
import { ProductBestsellerItem } from '@castlery/modules-product-components';
import { ScrollWrapper } from '@castlery/shared-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { BestsellersModuleName } from './config';
import { DtStack } from '@castlery/modules-tracking-components';

export const moduleName = 'Product Bestsellers';
interface ProductBestsellersProps {
  blok: BestsellersDefaultVariantV2 & {
    dyCampaignData: any;
  };
}
export function ProductBestsellers({ blok }: ProductBestsellersProps) {
  const { title, description, cta_link, dyCampaignData } = blok || {};
  const { desktop, tablet } = useBreakpoints();
  const items = dyCampaignData?.hitVariation?.slots;
  const hasItems = Array.isArray(items) && items.length > 0;
  if (!hasItems) {
    return null;
  }
  // PM: remove duplicate items & keep the first one & remove items without collection
  const useableItems = items.reduce((acc, item) => {
    const name = item.productData?.collection?.includes('|')
      ? item.productData?.collection?.split('|')[0]
      : item.productData?.collection;
    if (name) {
      const hasSameCollection = acc.some((accItem) => accItem.productData.collection === name);
      if (!hasSameCollection) {
        acc.push(item);
      }
    }
    return acc;
  }, []);
  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={BestsellersModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      sx={{
        background: (theme) => theme.palette.brand.flour[50],
        py: desktop ? '60px' : tablet ? 6 : 4,
        px: desktop ? 4 : 3,
      }}
    >
      <Stack gap={1} sx={{ alignItems: 'flex-start' }}>
        <CmsText blok={title[0]} />
        <CmsText blok={description[0]} />
        {!!cta_link && !!cta_link?.[0] && <CmsLink outerModuleName={BestsellersModuleName} blok={cta_link?.[0]} />}
      </Stack>
      <ScrollWrapper hideDesktopAction stepLength={desktop ? 432 * 3.5 : tablet ? 300 * 2 : 308}>
        <List
          orientation="horizontal"
          sx={{
            p: 0,
            gap: desktop ? 3 : 2,
          }}
        >
          {useableItems.map((item: any) => (
            <ListItem key={item.sku} sx={{ p: 0, m: 0 }}>
              <ProductBestsellerItem outerModuleName={BestsellersModuleName} {...item} />
            </ListItem>
          ))}
        </List>
      </ScrollWrapper>
    </DtStack>
  );
}

export default ProductBestsellers;
