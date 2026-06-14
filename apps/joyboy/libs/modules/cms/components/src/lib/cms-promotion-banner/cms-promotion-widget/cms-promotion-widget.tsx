'use client';

import { Card, CardContent, CardOverflow, Typography, useBreakpoints } from '@castlery/fortress';
import { DateBlokV2, ImageV2, LinkBlokV2, TextBlokV2 } from '@castlery/modules-cms-domain';
import { getDate, isOutdated } from '@castlery/modules-cms-services';
import { FortressImage } from '@castlery/shared-components';
import { useMemo } from 'react';
import CmsText from '../../cms-text/cms-text';
import CmsLink from '../../cms-link/cms-link';
import { PromotionBannerModuleName } from '../config';

export interface CmsPromotionWidgetProps {
  _uid: string;
  image: ImageV2;
  title: TextBlokV2[];
  description: TextBlokV2[];
  cta_link: LinkBlokV2[];
  is_date_range_display: boolean;
  start_end: DateBlokV2[];
  date_range: DateBlokV2[];
  component: string;
  isOpenContainer: boolean;
  _editable: string;
}

export const CmsPromotionWidget = (props: CmsPromotionWidgetProps) => {
  const {
    image,
    title = [],
    description = [],
    cta_link = [],
    is_date_range_display,
    start_end = [],
    date_range = [],
    // isOpenContainer,
  } = props;
  const { desktop, mobile } = useBreakpoints();
  const timeFormatData = useMemo(() => {
    return {
      dateStartTime: getDate(date_range[0]?.published_at),
      dateEndTime: getDate(date_range[0]?.ended_at),
    };
  }, [date_range]);
  if (isOutdated(start_end[0]?.published_at, start_end[0]?.ended_at)) {
    return null;
  }
  return (
    <Card
      size="lg"
      variant="plain"
      orientation={desktop ? 'horizontal' : 'vertical'}
      sx={{
        textAlign: 'center',
        maxWidth: '100%',
        width: desktop ? '780px' : mobile ? '100%' : '348px',
        overflow: 'auto',
        padding: '0',
        boxShadow: 'lg',
        borderRadius: '10px',
      }}
    >
      <CardOverflow
        variant="solid"
        color="primary"
        sx={{
          flex: desktop ? '1' : '0.65',
          display: 'flex',
          height: desktop ? '400px' : mobile ? '342px' : '348px',
          backgroundColor: 'transparent',
        }}
      >
        {image && <FortressImage src={image?.filename} alt="promotion banner widget" objectFit="cover" />}
      </CardOverflow>
      <CardContent
        sx={{
          gap: desktop ? '32px' : '24px',
          flex: desktop ? '1' : '0.35',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: !(desktop || mobile) ? 'flex-start' : 'center',
          alignItems: 'start',
          padding: !desktop ? '24px 16px' : 0,
          marginRight: desktop ? '20px' : '0',
          ...(!(desktop || mobile) && {
            minHeight: '292px',
          }),
        }}
      >
        {date_range[0] && is_date_range_display && date_range[0]?.published_at && date_range[0]?.ended_at && (
          <Typography
            sx={{
              fontFamily: 'var(--font-minerva-modern)',
              fontSize: '20px',
            }}
            level="body2"
          >
            {timeFormatData?.dateStartTime.format('MMM D')} - {timeFormatData?.dateEndTime.format('MMM D')}
          </Typography>
        )}

        {title[0] && (
          <CmsText
            blok={title[0]}
            sx={{
              textAlign: 'left',
            }}
          />
        )}
        {description[0] && (
          <CmsText
            blok={description[0]}
            sx={{
              textAlign: 'left',
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': '2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          />
        )}
        {cta_link[0] && <CmsLink outerModuleName={PromotionBannerModuleName} blok={cta_link[0]} />}
        {/* {!(date_range[0] && is_date_range_display && date_range[0]?.published_at && date_range[0]?.ended_at) &&
          isOpenContainer && (
            <Typography
              sx={{
                fontFamily: 'var(--font-minerva-modern)',
                marginTop: '28px',
              }}
              level="body2"
            />
          )} */}
      </CardContent>
    </Card>
  );
};
