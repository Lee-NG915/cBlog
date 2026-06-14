'use client';

import React from 'react';
// import { selectProduct } from '@castlery/modules-product-domain';
// import { useAppSelector } from '@castlery/shared-redux-store';
import Breadcrumbs from './breadcrumbs';

const ProductBreadcrumbs = ({
  ancestorCrumbs,
}: {
  ancestorCrumbs: {
    pageKey?: string;
    url?: string;
    title: string;
  }[];
}) => {
  // const product = useAppSelector(selectProduct);
  // const name = product?.name || '';

  return <Breadcrumbs ancestorCrumbs={ancestorCrumbs} />;
};

export { ProductBreadcrumbs };
