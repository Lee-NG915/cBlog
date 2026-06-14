'use client';
import {
  Product,
  ProductOptionTypeName,
  selectProductLoadingStatus,
  setLoadingStatus,
} from '@castlery/modules-product-domain';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { RadioGroup, Stack, Divider } from '@castlery/fortress';
import { ProductOptionLabel } from './product-option-label';
import { OptionsValue } from '../variant-selector/variant-selector';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useEffect, useState } from 'react';

/* eslint-disable-next-line */
export interface ProductModelOptionsProps {}

export const ProductModelOptions = ({ productData }: { productData: Product }) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const productLoadingStatus = useAppSelector(selectProductLoadingStatus);
  const [hasClicked, setHasClicked] = useState(false);
  const [relatedProductSlug, setRelatedProductSlug] = useState('');
  const [selectedName, setSelectedName] = useState('');
  useEffect(() => {
    productData.related_products.forEach((relatedProduct) => {
      if (relatedProduct.product_slug === params.slug) {
        setSelectedName(relatedProduct.product_slug);
      }
    });
  }, [params, productData]);
  useEffect(() => {
    if (hasClicked) {
      router.replace(`/${params?.locale}/products/${relatedProductSlug}`);
      setHasClicked(false);
      setRelatedProductSlug('');
    }
  }, [hasClicked, params?.locale, productLoadingStatus, relatedProductSlug, router, searchParams]);
  if (!(productData.related_products.length > 0)) return null;
  return (
    <Stack>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        sx={{
          minHeight: '56px',
        }}
      >
        <ProductOptionLabel text="Model" />
        {/* 这个要和sku里的进行收拢统一 */}
        {selectedName !== '' && (
          <RadioGroup
            orientation="horizontal"
            sx={{
              gap: 1,
              flexWrap: 'wrap',
              flexDirection: 'row',
              alignItems: 'center',
              paddingY: 1,
            }}
            defaultValue={selectedName}
          >
            {productData.related_products?.map((relatedProduct) => (
              <OptionsValue
                value={{
                  id: relatedProduct.id,
                  name: relatedProduct.product_slug,
                  presentation: relatedProduct.label,
                }}
                option={{
                  name: relatedProduct.label as ProductOptionTypeName,
                }}
                disabled={false}
                onAfterClick={() => {
                  dispatch(setLoadingStatus('loading'));
                  // dispatch(getProductByIdOrSlug.initiate(relatedProduct.product_slug, { forceRefetch: true }));
                  setHasClicked(true);
                  setRelatedProductSlug(relatedProduct.product_slug);
                }}
              />
            ))}
          </RadioGroup>
        )}
      </Stack>
    </Stack>
  );
};
