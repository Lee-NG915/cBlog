'use client';

import { TextBlokV2 } from '@castlery/modules-cms-domain';
import { WebProductOption } from '@castlery/modules-product-components';
import CmsText from '../cms-text/cms-text';
import CmsButton from '../cms-button/cms-button';
import CmsLink from '../cms-link/cms-link';
import { useBreakpoints, Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct } from '@castlery/modules-product-domain';
import { ProductOptionModuleName } from './config';

interface CmsProductOptionProps {
  blok: {
    _uid: string;
    title: TextBlokV2[];
    description: TextBlokV2[];
    cta: any[];
    button: any[];
  };
  anchorId?: string;
}

export function CmsProductOption(props: CmsProductOptionProps) {
  const { blok, anchorId } = props;
  const { title, description, cta, button } = blok;
  const { desktop, tablet } = useBreakpoints();
  const product = useAppSelector(selectProduct);
  const ctaData = Object.assign(cta[0], {
    ...cta[0],
    url_external_internal: `/products/${product?.slug}`,
    isExternalUrl: true,
  });
  return (
    <Stack
      {...storyblokEditable(blok)}
      key={blok?._uid}
      sx={{ py: desktop ? '60px' : tablet ? 6 : 4, backgroundColor: '#F3F3F3' }}
    >
      <WebProductOption
        titleSlot={<CmsText blok={title[0] || {}} />}
        descriptionSlot={<CmsText blok={description[0] || {}} />}
        ctaSlot={<CmsLink outerModuleName={ProductOptionModuleName} blok={ctaData || {}} />}
        buttonSlot={
          <CmsButton
            outerModuleName={ProductOptionModuleName}
            blok={button[0] || {}}
            sx={{
              marginBottom: 2,
            }}
          />
        }
        anchorId={anchorId}
        pageType="pla"
      />
    </Stack>
  );
}

export default CmsProductOption;
