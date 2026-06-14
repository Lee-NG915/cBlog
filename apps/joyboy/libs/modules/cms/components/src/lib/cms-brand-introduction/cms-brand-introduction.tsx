'use client';
import { Box, Divider, Stack, useBreakpoints } from '@castlery/fortress';
import { ImageV2, LinkBlokV2, RichTextV2, TextBlokV2 } from '@castlery/modules-cms-domain';
import { FortressImage } from '@castlery/shared-components';
import { hasRichText } from '../../utils/rich-text-utils';
import { CmsRichText } from '../cms-rich-text/cms-rich-text';
import CmsText from '../cms-text/cms-text';
import CmsLink from '../cms-link/cms-link';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';
import { BrandIntroductionModuleName } from './config';

interface CmsBrandIntroductionProps {
  blok: {
    _uid: string;
    image: ImageV2;
    component: string;
    brand_link: LinkBlokV2[];
    brand_rich_text: RichTextV2;
    brand_description: TextBlokV2[];
    _editable: string;
  };
}

export function CmsBrandIntroduction(props: CmsBrandIntroductionProps) {
  const { blok } = props;
  const { image, brand_link, brand_rich_text, brand_description } = blok || {};
  const { mobile, desktop } = useBreakpoints();
  return (
    <DtStack
      useImpression
      uid={blok?._uid}
      componentName={BrandIntroductionModuleName}
      {...storyblokEditable(blok)}
      key={blok?._uid}
      flexDirection={mobile ? 'column' : 'row'}
      justifyContent={mobile ? 'center' : 'space-between'}
      alignItems={'center'}
      gap={!mobile ? (desktop ? '56px' : '24px') : '0'}
      sx={{
        width: '100%',
        padding: mobile ? '0 0 32px 0' : desktop ? '60px' : '48px 24px',
        backgroundColor: 'var(--fortress-palette-brand-flour-10)',
      }}
    >
      <FortressImage
        src={image?.filename}
        alt="brand introduction"
        sx={{
          width: mobile ? '100%' : '45%',
          borderRadius: !mobile ? '10px' : 0,
        }}
        objectFit="cover"
        ratio={4 / 3}
      />
      <Stack
        sx={{
          width: mobile ? '100%' : '50%',
          padding: mobile ? '24px' : 0,
        }}
        justifyContent={'center'}
        alignItems={'start'}
      >
        {hasRichText(brand_rich_text) && (
          <CmsRichText
            description={brand_rich_text}
            sx={{
              'h1,h2,h3,h4,h5,h6,p,ol,ul,dl': {
                fontWeight: 'normal',
              },
            }}
          />
        )}
        <Divider
          sx={{
            margin: '8px 0 16px 0',
          }}
        />
        <Box>
          <CmsText blok={brand_description[0]} />
        </Box>
        <Box
          sx={{
            marginBottom: '16px',
          }}
        />
        <CmsLink outerModuleName={BrandIntroductionModuleName} blok={brand_link[0]} />
      </Stack>
    </DtStack>
  );
}

export default CmsBrandIntroduction;
