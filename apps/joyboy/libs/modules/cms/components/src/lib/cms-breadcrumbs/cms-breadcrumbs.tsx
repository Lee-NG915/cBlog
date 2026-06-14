'use client';
import { useProductBreadcrumbs, ProductBreadcrumbs } from '@castlery/shared-components';
import { Stack } from '@castlery/fortress';
import { useMemo } from 'react';

interface CmsBreadcrumbsProps {
  blok: {
    _uid: string;
    component: string;
    use_product_breadcrumbs: boolean;
    custom_fields?: {
      _uid: string;
      page_key?: string;
      url?: string;
      title: string;
    }[];
  };
}
export function CmsBreadcrumbs({ blok }: CmsBreadcrumbsProps) {
  const { custom_fields, use_product_breadcrumbs } = blok;
  const productBreadcrumbs = useProductBreadcrumbs();

  const arr = useMemo(() => {
    if (use_product_breadcrumbs) {
      return productBreadcrumbs?.map((item) => {
        return {
          title: item.name,
          url: item.url,
        };
      });
    }
    return custom_fields?.map((item) => ({ ...item, pageKey: item.page_key }));
  }, [use_product_breadcrumbs, custom_fields, productBreadcrumbs]);

  return (
    <Stack>
      <ProductBreadcrumbs ancestorCrumbs={arr} />
    </Stack>
  );
}

export default CmsBreadcrumbs;
