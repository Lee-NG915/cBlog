import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';

import ResponsiveSlick from 'components/ResponsiveSlick';
import SocialImage from 'components/SocialImage';
import Banner from 'components/Banner';
// import DYWrapper from 'components/DYWrapper';
import TaggedImage from 'components/TaggedImage';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { getBreakpoint } from 'utils/breakpoints';
import { wrapPage } from 'utils/page';
import { getUrl, getPageByPermalink } from 'pages';

import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { enableDisplayBlueSofaLink, globalFeatureInUS } from 'config';
import style from './style.scss';

const NewWayOfLiving = ({ marketing, loadMarketing }) => {
  const { desktop } = useBreakpoints();
  const categories = [
    {
      imageName: globalFeatureInUS ? 'armchairs-accent-chairs' : 'armchairs',
      permalink: globalFeatureInUS ? 'chairs/armchairs-accent-chairs' : 'chairs/armchairs',
    },
    {
      imageName: 'ottomans-poufs',
      permalink: 'sofas/ottomans-poufs',
    },
    {
      imageName: 'shelves-cabinets',
      permalink: 'storage',
    },
    {
      imageName: 'side-tables',
      permalink: 'tables/side-tables',
    },
  ];
  const containerRef = useRef(null);

  useEffect(() => {
    loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/ugc-pgc/social-images`);
    loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/shop-the-look`);
  }, [loadMarketing]);

  const socialImages =
    marketing && marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/ugc-pgc/social-images`];
  const shopTheLook =
    marketing && marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/shop-the-look`];
  let socialPosts;
  let styleTips;

  if (socialImages && socialImages.data) {
    socialPosts = socialImages.data.story.content.new_way_of_living.filter((post) => !post.disabled);
  }

  if (shopTheLook && shopTheLook.data) {
    styleTips = shopTheLook.data.story.content;
  }

  return (
    <div className={style.newWay} ref={containerRef}>
      <div className={`${style.newWay}__wrapper`}>
        <Container>
          <Banner
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: '/static/new-way-of-living/new-way-of-living-banner-mobile.jpg',
                loader: { ratio: 0.81333 },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/new-way-of-living/new-way-of-living-banner.jpg',
                loader: { ratio: 0.3125 },
              },
            ]}
            lazy={false}
            title="New Way Of Living"
          />
        </Container>
        <div className={`${style.newWay}__intro`}>
          <div className={`${style.newWay}__intro-detail`}>
            Recent events have pushed us to explore new ways of living — new routines, new hobbies and the increasing
            need to keep sane amidst it all. We know it’s never easy adjusting to change, so we’ve put together a guide
            of tips, ideas and inspo to help you embrace the new.
          </div>
        </div>
        <Container maxWidth="md">
          <div className={`${style.newWay}__step1`}>
            <Banner
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/step1-mobile.jpg`,
                  loader: { ratio: 3.50133 },
                },
                {
                  breakpoint: 'lg',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/step1.jpg`,
                  loader: { ratio: 0.95641 },
                },
              ]}
              lazy={false}
              title="Let's start with what you need"
            />
            <Link className={`${style.newWay}__step1__action`} to={getUrl('sofas/sectional-sofas', false, true)} />
          </div>

          <div data-campaign="LP NWOL Tables" />
          {/* <DYWrapper
            campaign="LP NWOL Tables"
            render={(selector) => <div id={selector} />}
          /> */}

          <div className={`${style.newWay}__homeHotel`}>
            <Banner
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/home-hotel-mobile.jpg`,
                  loader: { ratio: 1.54933 },
                },
                {
                  breakpoint: 'lg',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/home-hotel.jpg`,
                  loader: { ratio: 0.42735 },
                },
              ]}
              lazy={false}
              title="Hone your home hotel"
            />
            <Link className={`${style.newWay}__homeHotel__action`} to={getUrl('beds', false, true)} />
          </div>

          <div className={`${style.newWay}__step2`}>
            <Banner
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/step2-hobbyists-mobile.jpg`,
                  loader: { ratio: 3.48266 },
                },
                {
                  breakpoint: 'lg',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/step2-hobbyists.jpg`,
                  loader: { ratio: 0.95644 },
                },
              ]}
              lazy={false}
              title="Our new hobbyists"
            />
            <Link className={`${style.newWay}__step2__action`} to={getUrl('tables', false, true)} />
          </div>

          <div className={`${style.newWay}__cozyNook`}>
            <Banner
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/cozy-nook-mobile.jpg`,
                  loader: { ratio: 1.432 },
                },
                {
                  breakpoint: 'lg',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/cozy-nook.jpg`,
                  loader: { ratio: 0.42735 },
                },
              ]}
              lazy={false}
              title="Carve a cozy nook"
            />
            <div className={`${style.newWay}__categories`}>
              {categories.map((item) => {
                const page = getPageByPermalink(item?.permalink);
                if (page) {
                  return (
                    <Link to={page.url} key={item.permalink}>
                      <div className={`${style.newWay}__category`}>
                        <img
                          src={`https://res.cloudinary.com/castlery/image/upload/static/new-way-of-living/${item.imageName}.jpg`}
                          alt={item.imageName}
                        />
                        <div className={`${style.newWay}__category__name`}>{page.name}</div>
                      </div>
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          </div>

          <div data-campaign="LP NWOL Storage" />
          {/* <DYWrapper
            campaign="LP NWOL Storage"
            render={(selector) => <div id={selector} />}
          /> */}

          <div className={`${style.newWay}__step3`}>
            <Banner
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/step3-colors-2-mobile.jpg`,
                  loader: { ratio: 6.808 },
                },
                {
                  breakpoint: 'lg',
                  srcset: `/static/new-way-of-living/${__COUNTRY__}/step3-colors-2.jpg`,
                  loader: { ratio: 1.5194 },
                },
              ]}
              lazy={false}
              title="A fresh new look"
            />
            <Link className={`${style.newWay}__step3__yellow`} to="/products/cammy-armchair?material=canary_yellow" />
            <Link className={`${style.newWay}__step3__green`} to="/collections/pebble-collection?color[0]=green" />
            {globalFeatureInUS && (
              <Link
                className={`${style.newWay}__step3__blue--bed`}
                to="/products/quentin-bed?quantity=1&material=midnight_blue&bed_frame_size=queen"
              />
            )}
            {enableDisplayBlueSofaLink && (
              <Link
                className={`${style.newWay}__step3__blue--sofa`}
                to="/products/nathan-sofa-bed?material=midnight_blue"
              />
            )}
            <Link
              className={`${style.newWay}__step3__brown`}
              to="/collections/adams-collection?material_filter[0]=Leather"
            />
          </div>

          {styleTips && styleTips.add_life && (
            <div className={`${style.newWay}__tips`}>
              <h2>Style Tip #2:{!desktop ? <br /> : ''} Add life.</h2>
              <div className={`${style.newWay}__tips__intro`}>
                A plant rack. A new sculpture. A throw you crocheted all by yourself. Little touches like these give
                your home new life. Take cues from our happy customers (and happy pets!)
              </div>
              <div className={`${style.newWay}__tips__addLife`}>
                {styleTips.add_life.map((tip) => (
                  <TaggedImage
                    key={tip._uid}
                    image={{ url: tip.image, ratio: tip.ratio, lazy: false }}
                    anchorPoints={tip.anchor_points}
                  />
                ))}
              </div>
              <div className={`${style.newWay}__tips__addLife--mobile`}>
                {styleTips.add_life.map((tip) => (
                  <TaggedImage
                    key={tip._uid}
                    image={{
                      url: tip.image_mobile,
                      ratio: tip.ratio_mobile,
                      lazy: false,
                    }}
                    anchorPoints={tip.anchor_points_mobile}
                  />
                ))}
              </div>
            </div>
          )}

          {styleTips && styleTips.build_character && (
            <div className={`${style.newWay}__tips`}>
              <h2>Style Tip #3:{!desktop ? <br /> : ''} Build character.</h2>
              <div className={`${style.newWay}__tips__intro`}>
                Maybe it’s flaunting the gorgeous ornaments you copped from a balmy Bali honeymoon, or working your{' '}
                {globalFeatureInUS ? 'favorite' : 'favourite'} print into your everyday. Also,{' '}
                {globalFeatureInUS ? 'maybe consider some mood lighting?' : 'consider switching your bulb...'}
              </div>
              <div className={`${style.newWay}__tips__buildCharacter`}>
                {styleTips.build_character.map((tip) => (
                  <TaggedImage
                    key={tip._uid}
                    image={{ url: tip.image, ratio: tip.ratio, lazy: false }}
                    anchorPoints={tip.anchor_points}
                  />
                ))}
              </div>
              <div className={`${style.newWay}__tips__buildCharacter--mobile`}>
                {styleTips.build_character.map((tip) => (
                  <TaggedImage
                    key={tip._uid}
                    image={{
                      url: tip.image_mobile,
                      ratio: tip.ratio_mobile,
                      lazy: false,
                    }}
                    anchorPoints={tip.anchor_points_mobile}
                  />
                ))}
              </div>
            </div>
          )}

          {socialPosts && socialPosts.length > 0 && (
            <div className={`${style.newWay}__tips`}>
              <h2>
                <span>Style</span> Life Tip #4:
                {!desktop ? <br /> : ''} Stay connected.
              </h2>
              <div className={`${style.newWay}__tips__intro`}>
                Despite all that we’re doing to make home better, keeping positive isn’t a solo sport.
                <br />
                See what our community has been up to below.
              </div>
              <LazyLoad offset={300} once>
                <div className={`${style.socialWidget}__list`}>
                  <ResponsiveSlick
                    mediaQueries={
                      !desktop
                        ? [
                            {
                              query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                              numPerPage: 2,
                            },
                            {
                              query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                              numPerPage: 4,
                            },
                          ]
                        : [
                            {
                              query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                              numPerPage: 4,
                            },
                          ]
                    }
                  >
                    {socialPosts.map((post) => (
                      <div key={post._uid}>
                        <SocialImage post={post} collection="new-way-of-living" />
                      </div>
                    ))}
                  </ResponsiveSlick>
                </div>
              </LazyLoad>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

NewWayOfLiving.propTypes = {
  marketing: PropTypes.object,
  loadMarketing: PropTypes.func,
};

export default connect(
  (state) => ({
    marketing: state.marketing,
  }),
  { loadMarketing }
)(wrapPage()(NewWayOfLiving));
