'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { hasRichText } from '../../utils/rich-text-utils';
import { RichTextTypography } from '../component-v1/components';
import { ImageOrVideo } from '../component-v1/components/ImageOrVideo';
import { ImageProps } from '../component-v1/image';
import { VideoProps } from '../component-v1/video/video';
import { fontFamily } from '@castlery/fortress/Theme/v1/typography';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';

export type AccordionItemProps = {
  blok: {
    _uid: string;
    header: string;
    header_color: string;
    description?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    anchor_link?: string;
  };
};

const AccordionItem = ({ blok }: AccordionItemProps) => {
  const { header, header_color, description, image = [], video = [] } = blok || {};

  const { desktop } = useBreakpoints();

  const dispatch = useAppDispatch();

  const handleAccordionChange = (data: any, isExpanded: boolean) => {
    if (isExpanded && window?.dataLayer) {
      dispatch(EVENT_STORYBLOK({ action: 'accordion_open', label: header, method: document?.title || '' }));
    }
  };

  return (
    <Accordion onChange={handleAccordionChange}>
      {header && (
        <AccordionSummary>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              level="h5"
              sx={(theme) => ({
                color: header_color || theme.palette.brand.mono[900],
              })}
            >
              {header}
            </Typography>
          </Box>
        </AccordionSummary>
      )}
      <AccordionDetails>
        <Stack sx={{ marginBottom: '16px' }}>
          <ImageOrVideo
            video={video}
            image={image}
            loader={{
              ratio: !desktop ? 1.1162 : 0.4729,
            }}
          />
        </Stack>
        {hasRichText(description) && (
          <RichTextTypography
            description={description}
            sx={(theme) => ({
              color: theme.palette.brand.mono[900],
              p: {
                fontSize: desktop ? '14px !important' : '12px !important',
              },
              a: {
                textDecorationColor: theme.palette.brand.burntOrange[500],
              },
            })}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export { AccordionItem };
