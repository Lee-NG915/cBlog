import React from 'react';
import { wrapPage } from 'utils/page';
import { getUrl } from 'pages';
import Banner from 'components/Banner';
import PropTypes from 'prop-types';
import { DualBox, BannerEqualDualBox, OneDualBox } from 'components/DualBox';
import { GhostArrowBtn } from 'components/Button';
import ReviewSection from 'components/ReviewSection';
import PressSection from 'components/PressSection';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const stories = [
  {
    title: 'Materials That Last',
    desc: 'Every choice we make & material we use meets our highest standards, with quality craftsmanship, real-life resilience, and time-tested durability.',
    images: [
      {
        breakpoint: 'xs',
        srcset: '/static/our-story/edition2/ourstory-2-mobile.jpg',
        loader: { ratio: 1 },
      },
      {
        breakpoint: 'lg',
        srcset: '/static/our-story/edition2/ourstory-2.jpg',
        loader: { ratio: 1.284 },
      },
    ],
  },
  {
    title: 'Designed For Every Personal Style',
    desc: 'From mid-century modern to contemporary, our design language is intentionally universal; we design so you can settle in, comfortably, for the long haul.',
    images: [
      {
        breakpoint: 'xs',
        srcset: '/static/our-story/edition2/ourstory-3-mobile.jpg',
        loader: { ratio: 1 },
      },
      {
        breakpoint: 'lg',
        srcset: '/static/our-story/edition2/ourstory-3.jpg',
        loader: { ratio: 1.284 },
      },
    ],
  },
  {
    title: 'A Simplified Process For Better Prices',
    desc: 'The middleman wasn’t the first cut we made. From our early roots, we’ve overseen the entire build, ship, and delivery process to ensure the highest quality experience—with fair prices to match.',
    images: [
      {
        breakpoint: 'xs',
        srcset: '/static/our-story/edition2/ourstory-4-mobile.jpg',
        loader: { ratio: 1 },
      },
      {
        breakpoint: 'lg',
        srcset: '/static/our-story/edition2/ourstory-4.jpg',
        loader: { ratio: 1.284 },
      },
    ],
  },
];

const ourStoryImages = [
  {
    breakpoint: 'xs',
    srcset: '/static/our-story/edition2/ourstory-1.jpg',
    loader: { ratio: 1.2 },
  },
];

const StoryBanner = ({ story }) => (
  <Banner className={`${style.story}__banner`} mediaQueries={story.images} title="Our Story" />
);

StoryBanner.propTypes = {
  story: PropTypes.object,
};

const StoryText = ({ story }) => (
  <>
    <h2>{story.title}</h2>
    <p>{story.desc}</p>
    <GhostArrowBtn text="Shop All" border={false} href={getUrl('all-products')} />
  </>
);
StoryText.propTypes = {
  story: PropTypes.object,
};

const OurStory = () => {
  const { desktop } = useBreakpoints();
  return (
    <div className={style.story}>
      <OneDualBox
        leftClassName={`${style.story}__bannerLeft`}
        leftComponent={
          <>
            <video playsInline autoPlay muted loop className={`${style.story}__mobile-video`}>
              <source
                src="https://res.cloudinary.com/castlery/video/upload/vc_h265,ar_0.8,c_crop,ac_none/v1636691644/static/home/edition2/castlery_brand_v13.mp4"
                type="video/mp4; codecs=hvc1"
              />
              <source
                src="https://res.cloudinary.com/castlery/video/upload/vc_vp9,ar_0.8,c_crop,ac_none/v1636691644/static/home/edition2/castlery_brand_v13.webm"
                type="video/webm; codecs=vp9"
              />
              <source
                src="https://res.cloudinary.com/castlery/video/upload/vc_auto,ar_0.8,c_crop,ac_none/v1636691644/static/home/edition2/castlery_brand_v13.mp4"
                type="video/mp4"
              />
            </video>
            <video playsInline autoPlay muted loop className={`${style.story}__desktop-video`}>
              <source
                src="https://res.cloudinary.com/castlery/video/upload/vc_h265,c_limit,ac_none/v1636691644/static/home/edition2/castlery_brand_v13.mp4"
                type="video/mp4; codecs=hvc1"
              />
              <source
                src="https://res.cloudinary.com/castlery/video/upload/vc_vp9,c_limit,ac_none/v1636691644/static/home/edition2/castlery_brand_v13.webm"
                type="video/webm; codecs=vp9"
              />
              <source
                src="https://res.cloudinary.com/castlery/video/upload/vc_auto,c_limit,ac_none/v1636691644/static/home/edition2/castlery_brand_v13.mp4"
                type="video/mp4"
              />
            </video>
          </>
        }
        rightClassName={`${style.story}__bannerRight`}
        rightComponent={
          <div className={`${style.story}__bannerDesc`}>
            {!desktop && <h1>Our Story</h1>}
            <h2>Shopping for furniture has always been about filling a room with expensive design trends.</h2>
            <h2>We wanted to turn the tables.</h2>
          </div>
        }
      />
      <DualBox
        leftClassName={`${style.story}__idea`}
        leftComponent={
          <div>
            <h2>Because we believe everyone deserves a space to thrive.</h2>
            <p>
              A space to be wholly, truly themselves, without the burden of being out-priced or forced to choose "fast
              furniture".
            </p>
          </div>
        }
        rightComponent={<Banner className={`${style.story}__banner`} mediaQueries={ourStoryImages} title="Our Story" />}
        whichIsTop="right"
      />
      <div className={`${style.story}__slogan`}>
        <h2>
          We create furniture that opens everyones’ eyes to the spaces they already have—and the life that’s yet to be
          lived in them.
        </h2>
      </div>
      <Container fixed>
        {stories.map((story, i) => (
          <BannerEqualDualBox
            key={i}
            containerClassName={`${style.story}__container`}
            leftClassName={`${style.story}__item`}
            rightClassName={`${style.story}__item`}
            leftBanner={<StoryBanner story={story} />}
            rightComponent={<StoryText story={story} />}
            border
            rowReverse={i % 2 === 1}
          />
        ))}
      </Container>
      <div className={`${style.story}__divider1`} />
      <Container fixed>
        <ReviewSection />
      </Container>
      <div className={`${style.story}__divider2`} />
      <Container>
        <PressSection />
      </Container>
    </div>
  );
};
export default wrapPage({ pageType: 'Others' })(OurStory);
