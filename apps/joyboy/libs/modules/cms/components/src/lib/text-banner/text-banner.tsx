'use client';

import { Link, Stack, Theme, Typography, useBreakpoints } from '@castlery/fortress';
import { RightArrow } from '@castlery/fortress/Icons';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { hasRichText } from '../../utils/rich-text-utils';
import { RichTextTypography } from '../component-v1/components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';

interface TextBannerProps {
  blok: {
    header: string;
    header_color: string;
    sub_header: string;
    sub_header_color: string;
    sub_header_level: 'subh1' | 'subh2';
    description: string;
    background_color: string;
    link: {
      url: string;
      text: string;
      text_color: string;
      open_in_new_tab?: boolean;
    }[];
    _uid: string;
  };
}

const TextBanner = ({ blok }: TextBannerProps) => {
  const {
    header,
    header_color,
    sub_header,
    sub_header_color,
    sub_header_level,
    description,
    background_color,
    link,
    _uid,
  } = blok;

  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();

  const handleLinkClick = () => {
    dispatch(EVENT_STORYBLOK({ action: 'link_banner_click', label: header, method: document?.title || '' }));
  };

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="text-banner" uid={_uid} key={_uid}>
      <Stack
        sx={(theme) => ({
          width: '100%',
          padding: desktop ? `${15 * 4}px ${8 * 4}px` : `${10 * 4}px ${6 * 4}px`,
          backgroundColor: background_color,
        })}
      >
        <Typography
          level="h3"
          sx={(theme) => ({
            color: header_color || theme.palette.brand.maroonVelvet[500],
            mb: `${3 * 4}px`,
          })}
        >
          {header}
        </Typography>
        <Typography
          level={sub_header_level}
          sx={(theme) => ({
            color: sub_header_color || theme.palette.brand.maroonVelvet[500],
            mb: `${4 * 4}px`,
          })}
        >
          {sub_header}
        </Typography>
        {hasRichText(description) && (
          <RichTextTypography
            description={description}
            sx={(theme) => ({
              color: theme.palette.brand.maroonVelvet[500],
              mb: `${6 * 4}px`,
            })}
          />
        )}
        {link.length > 0 &&
          link.map((link, index) => (
            <Stack key={index} onClick={handleLinkClick} direction="row" alignItems="center">
              <Link
                href={link.url}
                target={link.open_in_new_tab ? '_blank' : '_self'}
                sx={(theme: Theme) => ({
                  color: link.text_color || theme.palette.brand.maroonVelvet[500],
                  textDecoration: 'underline',
                  mr: `${1.5 * 4}px`,
                  cursor: 'pointer',
                })}
                endDecorator={
                  <RightArrow
                    fill={link.text_color || '#3C101E'}
                    sx={(theme: Theme) => ({
                      width: `${6 * 4}px`,
                      height: `${6 * 4}px`,
                      fill: link.text_color || theme.palette.brand.maroonVelvet[500],
                      pointerEvents: 'auto',
                    })}
                  />
                }
              >
                {link.text}
              </Link>
              {/* <CustomLink linkKey={link.url}>
                <Typography>{link.text}</Typography>
              </CustomLink>
              <RightArrow
                fill={link.color || '#3C101E'}
                sx={(theme) => ({
                  width: `${6 * 4}px`,
                  height: `${6 * 4}px`,
                  fill: link.color || theme.palette.brand.maroonVelvet[500],
                  pointerEvents: 'auto',
                })}
              /> */}
            </Stack>
          ))}
      </Stack>
    </DtStack>
  );
};

export { TextBanner };
