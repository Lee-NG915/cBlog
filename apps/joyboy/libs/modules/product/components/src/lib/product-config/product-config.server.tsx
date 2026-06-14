import { Stack } from '@castlery/fortress';
import { getCachedPDPConfig } from '@castlery/modules-cms-services';
import { ProductBundleOptions } from './components/product-bundle-options/product-bundle-options';
import { ProductConfigurableOptions } from './components/product-configurable-options/product-configurable-options';
import { ProductModel } from './components/product-model/product-model';
import { ProductConfigClient } from './product-config.client';
import { ProductSelectorServer } from './components/product-selector/product-selector.server';
import { fetchCollections } from '@castlery/modules-cms-domain/server';

interface ProductConfigServerProps {
  slug: string;
  promise: Promise<any>;
  pageType: 'pdp' | 'pla';
}

export const ProductConfigServer = async (props: ProductConfigServerProps) => {
  const { slug, promise, pageType } = props;
  try {
    const results = await Promise.allSettled([promise, getCachedPDPConfig(slug), fetchCollections()]);

    const productData = results[0].status === 'fulfilled' ? results[0].value : null;
    const pdpConfig = results[1].status === 'fulfilled' ? results[1].value : null;
    const collectionData = results[2].status === 'fulfilled' ? results[2].value : null;

    const hasPdpSelector = pdpConfig?.indexMap?.[slug] !== undefined && productData?.product_type !== 'bundle';

    if (!hasPdpSelector) {
      return (
        <Stack>
          <ProductConfigClient />
          <ProductModel slug={slug} pageType={pageType} />
          {productData?.product_type === 'bundle' ? (
            <ProductBundleOptions />
          ) : (
            <ProductConfigurableOptions hasPdpSelector={false} />
          )}
        </Stack>
      );
    }

    let collectionPage = undefined;
    const taxon = productData?.taxons?.find(
      (t: { level: number; ancestors: string[] }) => t.level === 1 && t.ancestors[0] === 'Collections'
    );
    if (taxon) {
      const page = collectionData?.data?.find((item: any) => item.permalink === taxon.permalink);
      if (page) {
        collectionPage = page;
      }
    }

    return (
      <Stack>
        <ProductConfigClient />
        <ProductSelectorServer navigationState={pdpConfig?.uiTree} collectionPage={collectionPage} />
        <ProductConfigurableOptions hasPdpSelector={true} navigationState={pdpConfig?.uiTree} />
      </Stack>
    );
  } catch (error) {
    return null;
  }
};
