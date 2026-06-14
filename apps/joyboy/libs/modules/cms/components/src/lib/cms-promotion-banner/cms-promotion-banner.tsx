'use client';
import { useBreakpoints } from '@castlery/fortress';
import { CmsPromotionWidget, CmsPromotionWidgetProps } from './cms-promotion-widget/cms-promotion-widget';
import { isOutdated } from '@castlery/modules-cms-services';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';
import { PromotionBannerModuleName } from './config';

interface CmsPromotionBannerProps {
  blok: {
    _uid: string;
    promotion_widget: CmsPromotionWidgetProps[];
    _editable: string;
  };
}

export const CmsPromotionBanner = (props: CmsPromotionBannerProps) => {
  const { desktop, mobile } = useBreakpoints();
  const { promotion_widget } = props.blok;
  const aliveWidget = promotion_widget?.filter((widget: CmsPromotionWidgetProps, index: number) => {
    return !isOutdated(widget?.start_end[0]?.published_at, widget?.start_end[0]?.ended_at);
  });
  const checkDisplayDate = promotion_widget?.some((widget: CmsPromotionWidgetProps, index: number) => {
    return widget?.is_date_range_display && widget?.date_range[0]?.published_at && widget?.date_range[0]?.ended_at;
  });
  if (aliveWidget?.length === 0) return null;
  return (
    <DtStack
      useImpression
      uid={props.blok?._uid}
      componentName={PromotionBannerModuleName}
      {...storyblokEditable(props.blok)}
      key={props.blok?._uid}
      flexDirection={mobile ? 'column' : 'row'}
      justifyContent={'center'}
      alignItems={'center'}
      sx={{
        width: '100%',
        padding: desktop ? '60px 69px' : mobile ? '32px 24px' : '48px 24px',
        gap: desktop ? '32px' : '24px',
      }}
    >
      {promotion_widget?.map((widget: CmsPromotionWidgetProps, index: number) => {
        return <CmsPromotionWidget key={index} {...widget} isOpenContainer={checkDisplayDate} />;
      })}
    </DtStack>
  );
};
