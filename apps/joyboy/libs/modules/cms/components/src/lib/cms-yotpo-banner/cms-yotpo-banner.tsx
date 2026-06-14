'use client';
import { storyblokEditable } from '@storyblok/react/rsc';
import dynamic from 'next/dynamic';
import { DtStack } from '@castlery/modules-tracking-components';
import { YotpoBannerWidgetV2Storyblok } from '@castlery/types';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

const YotpoWidget = dynamic(() => import('@castlery/modules-promotion-components').then((mod) => mod.YotpoWidget), {
  ssr: false,
});
interface CmsYotpoBannerProps {
  blok: YotpoBannerWidgetV2Storyblok;
}
export function CmsYotpoBanner(props: CmsYotpoBannerProps) {
  const { blok } = props;
  const user = useAppSelector(selectedActiveUser);
  return (
    <DtStack
      useImpression
      uid={blok?._uid}
      componentName={blok?.component}
      {...storyblokEditable(blok)}
      key={blok?._uid}
    >
      <YotpoWidget {...blok} user={user} />
    </DtStack>
  );
}

export default CmsYotpoBanner;
