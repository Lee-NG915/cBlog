'use client';
import { Stack, useBreakpoints } from '@castlery/fortress';
import type { ProductsCollectionBlokV2 } from '../../types';
import { CmsText } from '../cms-text/cms-text';
import { CmsLink } from '../cms-link/cms-link';
import { ProductsCollectionModuleName } from './config';

export interface CollectionHeaderProps {
  blok: ProductsCollectionBlokV2;
  link: string;
}
export const CollectionHeader = ({ blok, link }: CollectionHeaderProps) => {
  const { title, description } = blok;
  const { desktop } = useBreakpoints();
  return (
    <Stack
      sx={{
        px: desktop ? 4 : 3,
        gap: 1,
      }}
    >
      <CmsText blok={title[0]} />
      <Stack gap={1} sx={{ flexFlow: 'row wrap', alignItems: 'center' }}>
        <CmsText blok={description[0]} />
        {!!link && (
          <CmsLink
            outerModuleName={ProductsCollectionModuleName}
            blok={{
              display_text: 'Explore More',
              isExternalUrl: true,
              url_external_internal: link,
              link_style: [{ color: { value: '#877445' }, text_level: 'body1' }],
              end_decorator: [{ name: 'ArrowRight', icon_width: 32, icon_height: 32, color: { value: '#877445' } }],
            }}
          />
        )}
      </Stack>
    </Stack>
  );
};
