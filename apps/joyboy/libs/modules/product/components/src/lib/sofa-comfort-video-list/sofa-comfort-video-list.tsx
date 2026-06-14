'use client';

import { RadioButton, RadioGroup, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { EVENT_HOW_IT_SITS } from '@castlery/modules-tracking-services';
import type { FortressVideoHandle } from '@castlery/shared-components';
import { FortressVideo } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useCallback, useEffect, useRef, useState } from 'react';

const SelectList = ({
  data,
  selectedPersona,
  onSelect,
}: {
  data: DecoratedSofaComfortVideoItemType[];
  selectedPersona: string;
  onSelect: (index: number, persona: string) => void;
}) => {
  return (
    <Stack>
      <RadioGroup
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          span: {
            marginTop: '0 !important',
          },
          gap: theme.spacing(3),
        })}
      >
        {data.map((item, index) => (
          <RadioButton
            key={item.persona}
            value={item.persona}
            label={item.persona}
            checked={selectedPersona === item.persona}
            onChange={(event) => onSelect(index, event.target.value)}
          />
        ))}
      </RadioGroup>
    </Stack>
  );
};

interface SofaComfortVideoItemType {
  media: {
    filename: string;
  };
  persona: string;
}

interface DecoratedSofaComfortVideoItemType {
  videoUrl: string;
  persona: string;
}

const SofaComfortVideoList = ({
  videoList,
  listTitle,
}: {
  videoList: SofaComfortVideoItemType[];
  listTitle: string;
}) => {
  const { desktop, mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [playingIndex, setPlayingIndex] = useState<number>(0);
  const [decoratedVideoList, setDecoratedVideoList] = useState<DecoratedSofaComfortVideoItemType[]>([]);
  const videoRefs = useRef<(FortressVideoHandle | null)[]>([]);
  const moduleRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedImpressionRef = useRef(false);
  const [isImpressionTracked, setIsImpressionTracked] = useState(false);
  const [isSeventyPercentVisible, setIsSeventyPercentVisible] = useState(false);
  const visibleDurationRef = useRef(0);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoAspectRatio = desktop ? 2.29 : 1.6;
  const trackHowItSits = useCallback(
    async (payload: {
      category: 'how_it_sits_impression' | 'how_it_sits_click' | 'how_it_sits_video_view';
      action: 'impression' | 'click' | 'video_view';
      label?: string;
      tag?: string;
      tagValue?: string | number;
    }) => {
      await dispatch(EVENT_HOW_IT_SITS(payload));
    },
    [dispatch]
  );
  const switchPlayingIndex = useCallback(
    (index: number) => {
      if (index === playingIndex) return false;
      videoRefs.current.forEach((videoRef) => {
        videoRef?.pause();
      });
      setPlayingIndex(index);
      return true;
    },
    [playingIndex]
  );
  const handleSelectIndex = useCallback(
    (index: number, persona: string) => {
      if (!switchPlayingIndex(index)) return;
      void trackHowItSits({
        category: 'how_it_sits_click',
        action: 'click',
        label: 'size_tab',
        tag: 'tab_label',
        tagValue: persona,
      });
    },
    [switchPlayingIndex, trackHowItSits]
  );
  const handleVideoEnded = useCallback(
    (index: number) => {
      if (index !== playingIndex) return;
      const total = decoratedVideoList.length;
      if (total <= 1) return;
      switchPlayingIndex((index + 1) % total);
    },
    [playingIndex, decoratedVideoList.length, switchPlayingIndex]
  );
  useEffect(() => {
    if (!decoratedVideoList.length) return;

    const target = moduleRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedImpressionRef.current) {
          hasTrackedImpressionRef.current = true;
          void (async () => {
            try {
              await trackHowItSits({
                category: 'how_it_sits_impression',
                action: 'impression',
              });
            } finally {
              setIsImpressionTracked(true);
            }
          })();
        }

        setIsSeventyPercentVisible(entry.intersectionRatio >= 0.7);
      },
      {
        threshold: [0, 0.7],
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [decoratedVideoList.length, trackHowItSits]);
  useEffect(() => {
    if (!isSeventyPercentVisible) {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      return;
    }

    if (durationTimerRef.current) return;

    durationTimerRef.current = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      visibleDurationRef.current += 1;

      if (visibleDurationRef.current % 5 === 0) {
        void trackHowItSits({
          category: 'how_it_sits_video_view',
          action: 'video_view',
          tag: 'watch_duration',
          tagValue: visibleDurationRef.current,
        });
      }
    }, 1000);

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [isSeventyPercentVisible, trackHowItSits]);
  useEffect(() => {
    const tempList = videoList.map((item) => ({
      videoUrl: item.media.filename,
      persona: item.persona,
    }));
    visibleDurationRef.current = 0;
    setPlayingIndex(0);
    setDecoratedVideoList(tempList);
  }, [videoList]);
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, decoratedVideoList.length);
  }, [decoratedVideoList.length]);
  useEffect(() => {
    if (!isImpressionTracked) return;
    videoRefs.current[playingIndex]?.replay();
  }, [isImpressionTracked, playingIndex]);

  if (!decoratedVideoList.length) return null;

  return (
    <div ref={moduleRef}>
      <Stack
        sx={(theme) => ({
          padding: `${theme.spacing(15)} ${theme.spacing(8)}`,
          backgroundColor: theme.palette.brand.warmLinen[500],
          ...(!desktop && {
            padding: `${theme.spacing(8)} 0`,
          }),
        })}
      >
        <Stack
          sx={(theme) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: theme.spacing(6),
            pl: 0,
            ...(!desktop && {
              pl: theme.spacing(4),
              pr: theme.spacing(4),
            }),
            ...(!desktop &&
              !mobile && {
                pl: theme.spacing(6),
                pr: theme.spacing(6),
              }),
            ...(mobile && {
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: theme.spacing(4),
            }),
          })}
        >
          <Typography level="h2">{listTitle}</Typography>
          <SelectList
            data={decoratedVideoList}
            selectedPersona={decoratedVideoList[playingIndex]?.persona ?? ''}
            onSelect={handleSelectIndex}
          />
        </Stack>
        <Stack>
          {decoratedVideoList.map((item, index) => (
            <Stack key={item.persona} sx={{ display: index === playingIndex ? 'block' : 'none' }}>
              <FortressVideo
                ref={(node) => {
                  videoRefs.current[index] = node;
                }}
                src={item.videoUrl}
                enableProgressTracking
                trackVideo={(percentage) => ({
                  category: 'how_it_sits_video_view',
                  action: 'video_view',
                  tag: 'watch_percentage',
                  tagValue: `${percentage}%`,
                })}
                autoPlay={index === playingIndex && isImpressionTracked}
                muted
                controls={false}
                loop={decoratedVideoList.length <= 1}
                onEnded={() => handleVideoEnded(index)}
                thumbnailConfig={{
                  disabled: true,
                }}
                videoConfig={{
                  aspectRatio: videoAspectRatio,
                  crop: 'fill',
                }}
                resolution={desktop ? 1440 : 1080}
                containerConfig={{
                  aspectRatio: videoAspectRatio,
                  objectFit: 'cover',
                }}
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
    </div>
  );
};

export { SofaComfortVideoList };
