'use client';

import { Stack } from '@castlery/fortress';
import { useBreakpoints } from '@castlery/fortress/hooks';
import { MappedSocialUgcItem } from '@castlery/modules-product-domain';
import { EVENT_SOCIAL_WIDGET } from '@castlery/modules-tracking-services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useFirstInView } from '@castlery/modules-tracking-components';
import { ScrollWrapper } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SocialUgcDrawer } from './social-ugc-drawer';
import { SocialUgcImage } from './social-ugc-image';
import SocialUgcModal from './social-ugc-modal';

const FIRST_IN_VIEW_OPTIONS = {
  threshold: 0.3,
} as const;

interface SocialUgcCarouselProps {
  socialSortedUgc: MappedSocialUgcItem[];
}

export function SocialUgcCarousel(props: SocialUgcCarouselProps) {
  const { socialSortedUgc } = props;
  const { desktop, tablet } = useBreakpoints();
  const mediaSize = desktop
    ? { width: 375, height: 560 }
    : tablet
    ? { width: 240, height: 358 }
    : { width: 145, height: 222 };
  const mediaRatio = mediaSize.width / mediaSize.height;
  const thumbnailAspectRatio = `${mediaSize.width}:${mediaSize.height}`;
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadedVideoIndicesRef = useRef<Set<number>>(new Set());
  const impressedIndicesRef = useRef<Set<number>>(new Set());

  const handleTrack = useCallback(
    async ({ action, label, position }: { action: string; label?: string | number; position?: number }) => {
      await dispatch(EVENT_SOCIAL_WIDGET({ action, label, position }));
    },
    [dispatch]
  );

  const checkVisibleItems = useCallback(() => {
    const visibleVideos: number[] = [];
    const visibleUgcItems: number[] = [];
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    itemRefs.current.forEach((element, index) => {
      if (!element || !element.isConnected) return;

      const rect = element.getBoundingClientRect();
      const visibleLeft = Math.max(rect.left, 0);
      const visibleTop = Math.max(rect.top, 0);
      const visibleRight = Math.min(rect.right, viewportWidth);
      const visibleBottom = Math.min(rect.bottom, viewportHeight);
      const visibleWidth = Math.max(0, visibleRight - visibleLeft);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibleArea = visibleWidth * visibleHeight;
      const totalArea = rect.width * rect.height;

      const visibilityRatio = totalArea > 0 ? visibleArea / totalArea : 0;
      const isInViewport = rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0 && rect.top < viewportHeight;
      const isVisible = visibilityRatio >= 0.7 || (isInViewport && visibilityRatio > 0);
      const isVideo = socialSortedUgc[index]?.fileType === 'video';

      if (isVisible) {
        visibleUgcItems.push(index);
      }

      if (isVisible && isVideo) {
        visibleVideos.push(index);
      }
    });

    setVisibleItems((prevVisible) => {
      if (prevVisible.length !== visibleVideos.length) {
        return visibleVideos;
      }
      const isEqual = prevVisible.every((val, idx) => val === visibleVideos[idx]);
      return isEqual ? prevVisible : visibleVideos;
    });

    visibleUgcItems.forEach((index) => {
      if (!impressedIndicesRef.current.has(index)) {
        impressedIndicesRef.current.add(index);
        const ugc = socialSortedUgc[index];
        if (ugc?._uid) {
          handleTrack({ action: 'image_impression', label: ugc._uid, position: index + 1 });
        }
      }
    });
  }, [handleTrack, socialSortedUgc]);

  const handleWidgetInView = useCallback(() => {
    handleTrack({ action: 'widget_impression' });
    checkVisibleItems();
  }, [checkVisibleItems, handleTrack]);

  const socialUgcRef = useFirstInView(handleWidgetInView, FIRST_IN_VIEW_OPTIONS);

  const throttledCheckVisible = useCallback(() => {
    if (throttleTimerRef.current) {
      return;
    }
    throttleTimerRef.current = setTimeout(() => {
      checkVisibleItems();
      throttleTimerRef.current = null;
    }, 100);
  }, [checkVisibleItems]);

  const handleShouldSwitch = useCallback(
    (index: number) => {
      const currentIndexInVisible = visibleItems.indexOf(index);
      if (currentIndexInVisible !== -1) {
        if (currentIndexInVisible === visibleItems.length - 1) {
          setCurrentPlayingIndex(visibleItems[0]);
        } else {
          setCurrentPlayingIndex(visibleItems[currentIndexInVisible + 1]);
        }
      }
    },
    [visibleItems]
  );

  useEffect(() => {
    visibleItems.forEach((index) => loadedVideoIndicesRef.current.add(index));
  }, [visibleItems]);

  useEffect(() => {
    if (visibleItems.length > 0) {
      setCurrentPlayingIndex((prevIndex) => {
        if (prevIndex !== null && visibleItems.includes(prevIndex)) {
          return prevIndex;
        }
        const newIndex = visibleItems[0];
        return prevIndex !== newIndex ? newIndex : prevIndex;
      });
    } else {
      setCurrentPlayingIndex((prevIndex) => (prevIndex !== null ? null : prevIndex));
    }
  }, [visibleItems]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkVisibleItems();
    }, 500);

    const handleResize = () => {
      checkVisibleItems();
    };

    const handleWindowScroll = () => {
      throttledCheckVisible();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [checkVisibleItems, throttledCheckVisible]);

  return (
    <>
      <Stack
        sx={{ width: '100%' }}
        mt={desktop ? 7 : 5}
        ref={socialUgcRef as React.Ref<HTMLDivElement>}
        onScrollCapture={throttledCheckVisible}
      >
        <ScrollWrapper
          hideTrack={false}
          hideDesktopAction={true}
          hideBottomAction={true}
          sx={{ pt: 0 }}
          scrollTrackHeight={0}
        >
          <Stack direction="row" sx={{ width: 'fit-content', minWidth: '100%', gap: desktop ? 4 : 3 }}>
            {socialSortedUgc?.map((ugc, index) => (
              <Stack
                key={ugc._uid || `ugc-${index}`}
                data-ugc-index={index}
                data-ugc-type={ugc.fileType}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(index, el as HTMLDivElement);
                  } else {
                    itemRefs.current.delete(index);
                  }
                }}
                sx={{
                  width: mediaSize.width,
                  flexShrink: 0,
                }}
              >
                <SocialUgcImage
                  ugc={ugc}
                  ratio={mediaRatio}
                  thumbnailAspectRatio={thumbnailAspectRatio}
                  isPlaying={currentPlayingIndex === index}
                  onShouldSwitch={() => handleShouldSwitch(index)}
                  shouldLoadVideo={visibleItems.includes(index) || loadedVideoIndicesRef.current.has(index)}
                  {...{
                    onClick: () => {
                      setCurrentIndex(index);
                      setOpen(true);
                      handleTrack({
                        action: ugc.fileType === 'video' ? 'video_click' : 'image_click',
                        label: ugc._uid,
                        position: index + 1,
                      });
                    },
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </ScrollWrapper>
      </Stack>
      {desktop ? (
        <SocialUgcModal
          open={open}
          onClose={() => setOpen(false)}
          ugcData={socialSortedUgc}
          initialIndex={currentIndex}
        />
      ) : (
        <SocialUgcDrawer
          open={open}
          onClose={() => setOpen(false)}
          ugcData={socialSortedUgc}
          initialIndex={currentIndex}
        />
      )}
    </>
  );
}
