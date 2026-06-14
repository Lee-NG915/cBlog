import React, { useRef } from 'react';
import { Stack, Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Carousel } from '../components';
import { ReviewHeader, AllReviewsLink } from './review';
import { useNumberOfLines } from '../hooks/lines';
import { useAnchorScroll } from '../hooks/anchor';

export type ReviewsCarouselProps = {
  blok: {
    general_header?: string;
    general_link?: {
      url?: string;
      target?: string;
    };
    items?: Array<{
      _uid: string;
    }>;
    anchor_link?: string;
  };
};

const ReviewsCarousel = ({ blok }: ReviewsCarouselProps) => {
  const { desktop } = useBreakpoints();
  const { general_header, general_link = {}, items = [], anchor_link } = blok;
  const { url } = general_link;
  const headerRef = useRef<HTMLDivElement>(null);
  const lineNum = useNumberOfLines(headerRef);
  const blokRef = useRef(null);

  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const settings = {
    slidesToShow: 1,
    fade: true,
    draggable: false,
    lazyLoad: false,
  };

  if (items.length === 0) {
    return null;
  }

  let generalBlok = blok;
  if (general_header || url) {
    generalBlok = {
      ...blok,
      items: items.map((item) => ({
        ...item,
        ...(general_header && {
          header: general_header,
        }),
        ...(url && {
          link: general_link,
        }),
      })),
      anchor_link: '',
    };
  }

  return (
    <Stack
      ref={blokRef}
      id={anchor_link?.slice(1)}
      sx={(theme) => ({
        '.slick-slider > .slick-dots': {
          pl: theme.spacing(6),
          bottom: 0,
          mb: theme.spacing(1),
          [theme.breakpoints.down('sm')]: {
            pl: 0,
          },
        },
      })}
    >
      {!desktop && (
        <Container
          sx={() => ({
            position: 'relative',
          })}
        >
          <ReviewHeader header={general_header} headerRef={headerRef} lineNum={lineNum} borderTop />
        </Container>
      )}

      <Carousel
        blok={generalBlok}
        sliderSettings={settings}
        widthPercentage="85.64%"
        trackStyleType="primary"
        hideTrack
      />

      <Container
        sx={(theme) => ({
          display: 'none',
          [theme.breakpoints.down('sm')]: {
            display: 'block',
          },
        })}
      >
        <AllReviewsLink header={general_header} link={general_link} />
      </Container>
    </Stack>
  );
};

export { ReviewsCarousel };
