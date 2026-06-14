'use client';
import { Box } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import type { TheLookComponentV2 } from '@castlery/modules-cms-domain';
import { EcEnv } from '@castlery/config';
import TheLook from './components/theLook';
import { CmsButton } from '../cms-button/cms-button';
import { CmsText } from '../cms-text/cms-text';
import { useParams } from 'next/navigation';
import { ShopTheLookModuleName } from './config';
import { ShopTheLookV2Storyblok } from '@castlery/types';

export interface DesktopShopTheLookProps {
  shopTheLook: ShopTheLookV2Storyblok;
  theLookData: TheLookComponentV2;
  sourceLink: string | undefined;
  variantIds: string;
}
export function Content({ shopTheLook, theLookData, sourceLink, variantIds }: DesktopShopTheLookProps) {
  const { desktop, tablet } = useBreakpoints();
  const { region } = useParams();
  const { title, description, cta_btn, cta_link_type } = shopTheLook;
  // const { title, description, cta_link_type, cta_btn } = shopTheLook;
  const { hotspots, image, tips, _uid } = theLookData;
  const btn = cta_btn?.[0];
  const _title = title[0];
  const _description = description[0];
  const theLookUrl = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${region}/shop-the-look`;
  // const theLookUrl = `https://www.castlery.com/${region}/shop-the-look`;
  return (
    <>
      <Box
        sx={{
          width: '100%',
          gap: '10px',
          py: desktop ? '60px' : tablet ? 6 : 4,
        }}
      >
        <CmsText
          blok={_title}
          sx={{
            px: desktop ? 4 : 3,
            textAlign: desktop ? 'center' : 'left',
          }}
        />
        <CmsText
          blok={_description}
          sx={{
            px: desktop ? 4 : 3,
            marginTop: '8px',
            textAlign: desktop ? 'center' : 'left',
            marginBottom: desktop ? '32px' : tablet ? '24px' : '16px',
          }}
        />

        <TheLook lookId={_uid} hotsPotsBlok={hotspots} imageUrl={image} tipsBlok={tips} variantIds={variantIds} />
        <Box
          sx={{ px: desktop ? 4 : 3, pt: desktop ? '36px' : 3, width: desktop ? '300px' : '100%', margin: '0 auto' }}
        >
          <CmsButton
            outerModuleName={ShopTheLookModuleName}
            blok={{
              ...(btn || {}),
              text: btn?.text || 'Start designing now',
              variant: btn?.variant || 'secondary',
              link: cta_link_type === '0' ? theLookUrl : sourceLink || '',
            }}
            onCustomClick={() => {}}
          />
        </Box>
      </Box>
    </>
  );
}

export default Content;
