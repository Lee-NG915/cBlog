'use client';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { CmsLink, cmsLinkClasses } from '../../cms-link/cms-link';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';

export const ServiceGuaranteeShortModuleName = 'Service Guarantee A';

export function ServiceGuaranteeShort({ blok }: any) {
  const { list = [] } = blok;
  const { desktop, mobile } = useBreakpoints();

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={ServiceGuaranteeShortModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      sx={{
        background: (theme) => theme.palette.brand.flour[50],
        gap: desktop ? 3 : 2,
        py: 3,
        px: mobile ? 4 : '60px',
        display: 'flex',
        flexFlow: mobile ? 'column wrap' : 'row wrap',
        justifyContent: mobile ? 'flex-start' : 'center',
      }}
    >
      {list.map((item: any) => {
        const { title } = item;
        return (
          <Stack
            sx={{
              maxWidth: 300,
              [`& .${cmsLinkClasses.root}`]: {
                justifyContent: 'flex-start',
              },
            }}
            key={title?.[0]?._uid}
          >
            <CmsLink outerModuleName={ServiceGuaranteeShortModuleName} blok={title[0]} />
          </Stack>
        );
      })}
    </DtStack>
  );
}

export default ServiceGuaranteeShort;
