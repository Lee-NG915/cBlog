'use client';

import { Container, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowForwardIos } from '@castlery/fortress/Icons';
import { useParams } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { NextFortressLink } from '../../next-fortress-link';

interface RefinedBreadcrumbsProps {
  name?: string;
  productBreadcrumbs?: {
    pageKey?: string;
    title: string;
    url: string;
  }[];
}

export const RefinedBreadcrumbs = (props: RefinedBreadcrumbsProps) => {
  const { name, productBreadcrumbs } = props;
  const { desktop } = useBreakpoints();
  const { region } = useParams();

  // 状态和引用用于检测换行
  const [isWrapped, setIsWrapped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullContentRef = useRef<HTMLDivElement>(null);

  const checkIfWrapped = () => {
    if (!desktop || !containerRef.current || !fullContentRef.current) {
      setIsWrapped(false);
      return;
    }

    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = fullContentRef.current.scrollWidth;

    setIsWrapped(contentWidth > containerWidth - 10);
  };

  useEffect(() => {
    if (!desktop) return;

    let timeoutId: NodeJS.Timeout;

    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIfWrapped, 100);
    };

    const resizeObserver = new ResizeObserver(debouncedCheck);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    setTimeout(checkIfWrapped, 0);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [desktop, productBreadcrumbs, name]);

  return (
    <Container
      ref={containerRef}
      disableGutters={desktop ? true : false}
      // px={!desktop ? 6 : undefined}
      // py={2}
      sx={{
        mt: desktop ? 2 : 4,
        mb: desktop ? 4 : 2,
        // mt: !desktop ? 4 : undefined,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Stack
        ref={fullContentRef}
        direction={'row'}
        alignItems={'center'}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          zIndex: -1,
          whiteSpace: 'nowrap',
        }}
      >
        {desktop && (
          <Stack direction={'row'} gap={'9px'} alignItems={'center'}>
            <NextFortressLink
              variant="secondary"
              href={`/${region}`}
              level="caption1"
              isExternalFlag
              sx={{
                textDecoration: 'none',
                color: 'var(--fortress-palette-brand-mono-700)',
              }}
            >
              Home
            </NextFortressLink>
            <ArrowForwardIos
              sx={{
                width: '18px',
                height: '18px',
                color: 'var(--fortress-palette-brand-mono-700)',
              }}
            />
          </Stack>
        )}
        {productBreadcrumbs?.map((a, index) => {
          const { pageKey, url } = a;
          const linkProps = pageKey ? { linkKey: pageKey } : { href: url, isExternalFlag: true };
          return (
            <Stack direction={'row'} gap={'9px'} key={index} alignItems={'center'} ml={'9px'}>
              <NextFortressLink
                {...linkProps}
                variant="secondary"
                level="caption1"
                sx={{
                  textDecoration: 'none',
                  color: 'var(--fortress-palette-brand-mono-700)',
                }}
              >
                {a.title}
              </NextFortressLink>
              <ArrowForwardIos
                sx={{
                  width: '18px',
                  height: '18px',
                  color: 'var(--fortress-palette-brand-mono-700)',
                }}
              />
            </Stack>
          );
        })}
        {desktop && (
          <Typography
            level="caption1"
            ml={'9px'}
            sx={{
              color: 'var(--fortress-palette-brand-mono-700)',
            }}
          >
            {name}
          </Typography>
        )}
      </Stack>
      {desktop && !isWrapped && (
        <Stack direction={'row'} gap={'9px'} alignItems={'center'}>
          <NextFortressLink
            variant="secondary"
            href={`/${region}`}
            level="caption1"
            isExternalFlag
            sx={{
              textDecoration: 'none',
              color: 'var(--fortress-palette-brand-mono-700)',
            }}
          >
            Home
          </NextFortressLink>
          <ArrowForwardIos
            sx={{
              width: '18px',
              height: '18px',
              color: 'var(--fortress-palette-brand-mono-700)',
            }}
          />
        </Stack>
      )}
      {productBreadcrumbs?.map((a, index) => {
        const { pageKey, url } = a;
        const linkProps = pageKey ? { linkKey: pageKey } : { href: url, isExternalFlag: true };
        const isLastItem = index === productBreadcrumbs.length - 1;
        const shouldShowArrow = !desktop ? !isLastItem : isLastItem ? !isWrapped : true;

        return (
          <Stack
            direction={'row'}
            gap={'9px'}
            key={index}
            alignItems={'center'}
            ml={(isWrapped || !desktop) && index === 0 ? 0 : '9px'}
          >
            <NextFortressLink
              {...linkProps}
              variant="secondary"
              level="caption1"
              sx={{
                textDecoration: 'none',
                color: 'var(--fortress-palette-brand-mono-700)',
              }}
            >
              {a.title}
            </NextFortressLink>
            {shouldShowArrow && (
              <ArrowForwardIos
                sx={{
                  width: '18px',
                  height: '18px',
                  color: 'var(--fortress-palette-brand-mono-700)',
                }}
              />
            )}
          </Stack>
        );
      })}
      {desktop && !isWrapped && (
        <Typography
          level="caption1"
          ml={'9px'}
          sx={{
            color: 'var(--fortress-palette-brand-mono-700)',
          }}
        >
          {name}
        </Typography>
      )}
    </Container>
  );
};
