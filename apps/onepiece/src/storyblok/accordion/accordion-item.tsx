import React, { useRef } from 'react';
import { Typography, Stack } from '@castlery/fortress';

import { AccordionContent, AccordionItem as FAccordionItem, AccordionHeader } from 'fortress';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useAnchorScroll } from '../hooks/anchor';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../tool';

export type AccordionItemProps = {
  blok: {
    _uid?: string;
    header: string;
    description?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    anchor_link?: string;
  };
};

function AccordionItem({ blok }: AccordionItemProps) {
  const { _uid, header, description, image = [], video = [], anchor_link } = blok || {};
  const { desktop } = useBreakpoints();
  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  return (
    <FAccordionItem value={header} key={_uid} id={anchor_link?.slice(1)} ref={blokRef}>
      <AccordionHeader>
        <Typography
          level="body1"
          sx={(theme) => ({
            '@media (hover: hover) ': {
              '&:hover': {
                color: theme.palette.brand.terracotta[500],
              },
            },
          })}
        >
          {header}
        </Typography>
      </AccordionHeader>

      <AccordionContent>
        <Stack
          gap={2}
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              px: theme.spacing(1),
            },
          })}
        >
          <ImageOrVideo
            video={video}
            image={image}
            loader={{
              ratio: !desktop ? 1.1162 : 0.4729,
            }}
          />

          {hasRichText(description) && (
            <RichTextTypography
              sx={(theme) => ({
                px: theme.spacing(4),
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
              description={description}
            />
          )}
        </Stack>
      </AccordionContent>
    </FAccordionItem>
  );
}

export { AccordionItem };
