'use client';
import type { LinkBlokV2 } from '@castlery/modules-cms-domain';
import { useMemo } from 'react';
import { CmsIcon } from '../cms-icon/cms-icon';
import { CustomLink } from '@castlery/shared-components';
import { Box, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useTrackingTags } from '@castlery/modules-tracking-components';

export const cmsLinkClasses = {
  root: 'cms-link-root-row',
};
export interface CmsLinkProps {
  outerModuleName?: string;
  blok: LinkBlokV2;
}
export function CmsLink({ blok, outerModuleName = '' }: CmsLinkProps) {
  const { desktop, mobile } = useBreakpoints();
  const {
    key,
    isExternalUrl,
    url_external_internal,
    display_text,
    link_style = [],
    open_new_tab,
    start_decorator = [],
    end_decorator = [],
    data_selenium,
  } = blok || {};

  const linkProps = useMemo(() => {
    const { underline, variant, color, text_level, mobile_font_size, tablet_font_size, desktop_font_size } =
      link_style[0] || {};
    let fontSize = undefined;
    if (desktop && desktop_font_size) {
      fontSize = Number(desktop_font_size);
    } else if (mobile && mobile_font_size) {
      fontSize = Number(mobile_font_size);
    } else if (tablet_font_size) {
      fontSize = Number(tablet_font_size);
    } else {
      fontSize = undefined;
    }
    let obj: any = {
      variant: variant || 'solid',
      underline: underline || 'none',
      level: text_level || 'body2',
      color: color?.value || '#3234233',
      target: open_new_tab ? '_blank' : '_self',
      fontSize,
    };

    if (start_decorator) {
      const iconWidth = start_decorator[0]?.icon_width ? Number(start_decorator[0]?.icon_width) : 0;
      const iconHeight = start_decorator[0]?.icon_height ? Number(start_decorator[0]?.icon_height) : 0;

      obj = {
        ...obj,
        start_decorator: (
          <CmsIcon
            name={(start_decorator[0]?.name as 'ArrowLeft' | 'ArrowRight') || ''}
            props={{
              sx: {
                width: iconWidth || (desktop ? 18 : 16),
                height: iconHeight || (desktop ? 18 : 16),
                fontSize: iconWidth || (desktop ? 18 : 16),
                color: start_decorator[0]?.color?.value || '',
              },
            }}
          />
        ),
      };
    }
    if (end_decorator) {
      const iconWidth = end_decorator[0]?.icon_width ? Number(start_decorator[0]?.icon_width) : 0;
      const iconHeight = end_decorator[0]?.icon_height ? Number(start_decorator[0]?.icon_height) : 0;
      obj = {
        ...obj,
        end_decorator: (
          <CmsIcon
            name={(end_decorator[0]?.name as 'ArrowLeft' | 'ArrowRight') || ''}
            props={{
              sx: {
                color: end_decorator[0]?.color?.value || '',
                width: iconWidth || (desktop ? 18 : 16),
                height: iconHeight || (desktop ? 18 : 16),
                fontSize: iconWidth || (desktop ? 18 : 16),
              },
            }}
          />
        ),
      };
    }
    return obj;
  }, [desktop, end_decorator, link_style, mobile, open_new_tab, start_decorator]);

  const trackingTags = useTrackingTags({
    moduleName: outerModuleName,
    elementName: blok?.display_text,
  });

  return (
    <Box
      {...storyblokEditable(blok)}
      key={blok._uid}
      sx={{
        a: {
          textDecoration: 'none',
        },
      }}
    >
      <CustomLink
        {...trackingTags}
        linkKey={key}
        isExternalFlag={isExternalUrl}
        data-selenium={data_selenium || ''}
        href={url_external_internal}
        {...(open_new_tab && {
          target: '_blank',
        })}
      >
        <Stack
          className={cmsLinkClasses.root}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={'8px'}
          sx={{
            textDecoration: linkProps.underline === 'underline' ? 'underline' : 'none',
            '&:hover': {
              textDecoration: linkProps.underline === 'hover' ? 'underline' : 'none',
            },
            textDecorationColor: `${linkProps.color} !important`,
          }}
        >
          {start_decorator && linkProps.start_decorator}
          <Typography
            level={linkProps.level}
            sx={{
              color: linkProps.color,
              ...(linkProps?.fontSize && { fontSize: linkProps.fontSize }),
            }}
          >
            {display_text}
          </Typography>
          {end_decorator && linkProps.end_decorator}
        </Stack>
      </CustomLink>
    </Box>
  );
}

export default CmsLink;
