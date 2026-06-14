'use client';
import { Stack, Card, useBreakpoints } from '@castlery/fortress';
import { CmsText } from '../../cms-text/cms-text';
import { cmsLinkClasses } from '../../cms-link/cms-link';
import { CmsRichText } from '../../cms-rich-text/cms-rich-text';
import { storyblokEditable } from '@storyblok/react/rsc';
import { CmsIcon } from '../../cms-icon/cms-icon';
import { DtStack } from '@castlery/modules-tracking-components';
import { createDataTrackingData } from '@castlery/utils';
import { MarkTypes } from '@storyblok/richtext';
import { serviceGuaranteeAnchor } from '@castlery/modules-product-services';

export const ServiceGuaranteeModuleName = 'Service Guarantee B';

export function ServiceGuarantee({ blok }: any) {
  const { list = [] } = blok;
  const { desktop, md, tablet, lg, xl } = useBreakpoints();

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={ServiceGuaranteeModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      id={serviceGuaranteeAnchor.anchor_id}
      sx={{
        display: 'grid',
        gridTemplateColumns:
          lg || xl ? 'repeat(4, minmax(250px, 358px))' : tablet || md ? 'repeat(2,minmax(352px, auto))' : '1fr',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        background: (theme) => theme.palette.brand.flour[50],
        ...(desktop
          ? {
              p: '60px',
              gap: lg ? 4 : '60px',
            }
          : {
              py: 4,
              px: 3,
              gap: tablet || md ? 2 : 3,
            }),
      }}
    >
      {list.map((item: any, index: number) => {
        const { title, description, guide_link, title_icon } = item; //title, guide_link,
        return (
          <Card
            key={index}
            sx={{
              borderColor: 'transparent',
              borderRadius: '10px',
              boxShadow: '0px 0px 20px -4px rgba(34, 34, 34, 0.08)',
              p: 3,
              gap: 2,
              [`& .${cmsLinkClasses.root}`]: {
                justifyContent: 'flex-start',
              },
            }}
          >
            <Stack sx={{ mb: 0.5, alignItems: 'center', gap: '12px' }} direction={'row'}>
              <CmsIcon
                name={title_icon?.[0]?.name}
                props={{
                  sx: {
                    color: title_icon?.[0]?.color?.value || '',
                    fontSize: title_icon?.[0]?.icon_width + 'px' || (desktop ? 18 : 16),
                  },
                }}
              />
              <CmsText blok={title[0]} />
            </Stack>
            <CmsText blok={description[0]} />
            <CmsRichText
              description={guide_link}
              customResolver={{
                resolvers: {
                  [MarkTypes.LINK]: (node) => {
                    const dataTag = createDataTrackingData({
                      module: ServiceGuaranteeModuleName,
                      elementName: node.text,
                    });
                    return `<a href="${node.attrs?.href}" data-dt-id="${dataTag['data-dt-id']}" target="${node.attrs?.target}">${node.text}</a>`;
                  },
                },
              }}
            />
          </Card>
        );
      })}
    </DtStack>
  );
}

export default ServiceGuarantee;
