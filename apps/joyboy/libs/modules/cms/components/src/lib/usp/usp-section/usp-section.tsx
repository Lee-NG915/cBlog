'use client';
import { Stack } from '@castlery/fortress';
import { UspVariantA } from '../usp-variant-a/usp-variant-a';
import { UspVariantB } from '../usp-variant-b/usp-variant-b';
import { UspVariantC } from '../usp-variant-c/usp-variant-c';
import { storyblokEditable } from '@storyblok/react/rsc';

export const dataFilters = {
  usp_variant_c_data_v2: 'usp_variant_c_data_v2',
  usp_variant_b_data_v2: 'usp_variant_b_data_v2',
  usp_variant_a_data_v2: 'usp_variant_a_data_v2',
};

export function UspSection({ blok }: any) {
  const {
    variant_a,
    variant_b,
    variant_c,
    data_source = [
      {
        usp_variant_a_data: {},
        usp_variant_b_data: {},
        usp_variant_c_data: {},
      },
    ],
  } = blok || {};

  const variantA = variant_a[0];
  const variantB = variant_b[0];
  const variantC = variant_c[0];
  const { list } = data_source[0] || {};

  return (
    <Stack {...storyblokEditable(blok)} key={blok._uid}>
      {Array.isArray(list) &&
        list?.map((item: any) => {
          if (item?.component === dataFilters.usp_variant_a_data_v2) {
            return <UspVariantA key={blok._uid} blok={{ ...variantA, data_source: item }} />;
          } else if (item?.component === dataFilters.usp_variant_b_data_v2) {
            return <UspVariantB key={blok._uid} blok={{ ...variantB, data_source: item }} />;
          } else if (item?.component === dataFilters.usp_variant_c_data_v2) {
            return <UspVariantC key={blok._uid} blok={{ ...variantC, data_source: item }} />;
          }
          return <></>;
        })}
    </Stack>
  );
}

export default UspSection;
