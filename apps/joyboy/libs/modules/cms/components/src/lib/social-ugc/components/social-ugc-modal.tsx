'use client';

import { useBreakpoints } from '@castlery/fortress/hooks';
import { SocialUgcModal as SocialUgcDesktopModal, SocialUgcDrawer } from '@castlery/modules-product-components';
import { MappedSocialUgcItem } from '@castlery/modules-product-domain';
import { useEffect, useState } from 'react';
import { ImageProps } from '../../component-v1/image';
import { VideoProps } from '../../component-v1/video';

interface SocialUgcModalProps {
  ugcData: {
    _uid?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    link: {
      url?: string;
      target?: string;
    };
    creator: string;
    content: string;
    product_list: string;
  }[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

const SocialUgcModal = ({ ugcData, initialIndex, open, onClose }: SocialUgcModalProps) => {
  const { desktop } = useBreakpoints();
  const [socialSortedUgc, setSocialSortedUgc] = useState<MappedSocialUgcItem[]>([]);

  useEffect(() => {
    const sortedUgc: MappedSocialUgcItem[] = ugcData.map((item) => {
      return {
        media:
          item.image && item.image.length > 0
            ? item.image[0].desktop_url
            : item.video && item.video.length > 0
            ? item.video[0].desktop_url
            : '',
        ig_handle: item.creator,
        content: item.content || '',
        variants: item.product_list,
        fileType: item.image.length > 0 ? 'image' : 'video',
        startOffset: 0,
        _uid: item._uid || 0,
        component: 'ugc',
      };
    });

    setSocialSortedUgc(sortedUgc);
  }, [ugcData]);

  if (desktop) {
    return (
      <SocialUgcDesktopModal open={open} onClose={onClose} ugcData={socialSortedUgc} initialIndex={initialIndex} />
    );
  }

  return <SocialUgcDrawer open={open} onClose={onClose} ugcData={socialSortedUgc} initialIndex={initialIndex} />;
};

export { SocialUgcModal };
