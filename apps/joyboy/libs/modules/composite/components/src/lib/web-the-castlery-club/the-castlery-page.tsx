'use client';

import { EcEnv } from '@castlery/config';
import { Box, Skeleton, Stack } from '@castlery/fortress';
import { createSbService } from '@castlery/modules-cms-services';
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { YotpoScript } from '@castlery/modules-promotion-components';
import type { ISbStoryData } from '@storyblok/react';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { BirthdayModal } from './components/birthday-modal';
import { captureStructuredError } from '@castlery/observability/client';

interface TheCastleryClubPageProps {
  SbPageComponent: React.ComponentType<{ blok: ISbStoryData['content'] }>;
}

interface StoryblokRenderBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  region: string;
  slug: string;
  storyId?: number;
}

const pageWrapperSx = {
  py: {
    xs: 7,
    md: 8,
  },
  main: {
    margin: '0 !important',
    padding: '0 !important',
    width: '100% !important',
  },
  '& .MuiContainer-root': {
    padding: '0 !important',
  },
} as const;

function getTheCastleryClubSlug(region: string) {
  return `${region}/general-content-v2/tcc-pages/the-castlery-club${
    EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test') ? '-test' : ''
  }`;
}

function toError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

function TheCastleryClubPageSkeleton() {
  return (
    <Box sx={pageWrapperSx}>
      <Stack
        spacing={{ xs: 3, md: 4 }}
        sx={{
          minHeight: {
            xs: 760,
            md: 1120,
          },
          px: {
            xs: 2,
            sm: 3,
            md: 0,
          },
        }}
      >
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            width: '100%',
            minHeight: {
              xs: 260,
              md: 380,
            },
            borderRadius: {
              xs: 'lg',
              md: 'xl',
            },
          }}
        />
        <Stack spacing={1.5} sx={{ maxWidth: 760 }}>
          <Skeleton variant="text" width="38%" sx={{ height: 42 }} />
          <Skeleton variant="text" width="92%" sx={{ height: 24 }} />
          <Skeleton variant="text" width="78%" sx={{ height: 24 }} />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={`club-card-skeleton-${index}`}
              variant="rectangular"
              animation="wave"
              sx={{
                width: '100%',
                minHeight: 180,
                borderRadius: 'xl',
              }}
            />
          ))}
        </Box>
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            width: '100%',
            minHeight: {
              xs: 220,
              md: 300,
            },
            borderRadius: 'xl',
          }}
        />
      </Stack>
    </Box>
  );
}

function StoryblokLoadFallback() {
  return (
    <Box
      sx={{
        ...pageWrapperSx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: {
          xs: 360,
          md: 520,
        },
        px: 3,
        textAlign: 'center',
      }}
    >
      <p>Unable to load rewards content</p>
    </Box>
  );
}

class StoryblokRenderBoundary extends Component<StoryblokRenderBoundaryProps, { hasError: boolean }> {
  constructor(props: StoryblokRenderBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureStructuredError(error, {
      tags: {
        component: 'the_castlery_club_page',
        issue: 'storyblok_render_failed',
        content_source: 'storyblok',
      },
      extra: {
        boundaryName: 'TheCastleryClubStoryblokBoundary',
        componentStack: errorInfo.componentStack,
        slug: this.props.slug,
        region: this.props.region,
        storyId: this.props.storyId,
        applicationEnv: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
      },
    });
  }

  componentDidUpdate(prevProps: StoryblokRenderBoundaryProps) {
    if (this.state.hasError && prevProps.storyId !== this.props.storyId) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

async function getStoryblokContent(region: string): Promise<ISbStoryData | null> {
  const slug = getTheCastleryClubSlug(region);
  try {
    const sbService = createSbService();
    // 在客户端组件中，使用 getStoryInRealTime 而不是 getStory
    // 因为 getStory 会调用 getStoryWithCache，该方法使用了服务端专用的 cache() API
    // getStoryInRealTime 可以在客户端正常使用
    const story = await sbService.getStoryInRealTime(slug);

    if (!story?.content) {
      captureStructuredError(new Error('Castlery Club Storyblok response missing content'), {
        tags: {
          component: 'the_castlery_club_page',
          issue: 'storyblok_content_missing',
          content_source: 'storyblok',
        },
        extra: {
          slug,
          region: EcEnv.NEXT_PUBLIC_COUNTRY,
          applicationEnv: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
        },
      });
      return null;
    }

    return story;
  } catch (error) {
    captureStructuredError(toError(error, 'Failed to fetch Storyblok content for Castlery Club'), {
      tags: {
        component: 'the_castlery_club_page',
        issue: 'storyblok_fetch_failed',
        content_source: 'storyblok',
      },
      extra: {
        slug,
        region: EcEnv.NEXT_PUBLIC_COUNTRY,
        applicationEnv: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
    return null;
  }
}

export function TheCastleryClubPage({ SbPageComponent }: TheCastleryClubPageProps) {
  const user = useAppSelector(selectedActiveUser);
  const [story, setStory] = useState<ISbStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [yotpoReady, setYotpoReady] = useState(false);
  const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  const slug = getTheCastleryClubSlug(region);

  useEffect(() => {
    async function fetchStory() {
      setLoading(true);
      const storyData = await getStoryblokContent(region);
      setStory(storyData);
      setLoading(false);
    }

    if (region) {
      fetchStory();
    }
  }, [region]);

  // 等待 Storyblok 内容渲染完成后再加载 Yotpo
  useEffect(() => {
    if (!story || loading) {
      setYotpoReady(false);
      return;
    }

    let isMounted = true;
    let timerId: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 15; // 最多重试 15 次 (约3秒)

    const checkYotpoContainers = () => {
      if (!isMounted || retryCount >= MAX_RETRIES) return;

      const hasYotpoContainers =
        document.querySelector('[data-yotpo-instance-id]') ||
        document.querySelector('[data-yotpo-widget-id]') ||
        document.querySelector('.yotpo-widget-instance');

      if (hasYotpoContainers) {
        setYotpoReady(true);
      } else {
        retryCount++;
        timerId = setTimeout(checkYotpoContainers, 200);
      }
    };

    // 延迟 300ms 开始检查
    timerId = setTimeout(checkYotpoContainers, 300);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [story, loading]);

  if (loading) {
    return <TheCastleryClubPageSkeleton />;
  }

  if (!story) {
    return <StoryblokLoadFallback />;
  }

  return (
    <Box sx={pageWrapperSx}>
      <Stack>
        <StoryblokRenderBoundary
          key={story.id ?? slug}
          fallback={<StoryblokLoadFallback />}
          region={region}
          slug={slug}
          storyId={story.id}
        >
          <SbPageComponent blok={story.content} />
        </StoryblokRenderBoundary>
        <BirthdayModal />
        {/* 等待 Storyblok 内容渲染完成并确认 Yotpo 容器存在后再加载 Yotpo widgets */}
        {EcEnv.NEXT_PUBLIC_YOTPO_ENABLED && yotpoReady && <YotpoScript user={user} />}
      </Stack>
    </Box>
  );
}
