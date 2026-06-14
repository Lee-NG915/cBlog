import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import { wrapPage } from 'utils/page';
import { renderImage } from 'utils/image';
import { getUrl } from 'pages';
import Banner from 'components/Banner';
// import DYWrapper from 'components/DYWrapper';
import SellingPoint from 'components/SellingPoint';
import ImageSection from 'components/ImageSection';

import returnSVG from 'images/usp/return.svg';
import shippingSVG from 'images/usp/shipping.svg';
import swatchSVG from 'images/usp/swatch.svg';

import { Container } from '@castlery/fortress';
import style from './style.scss';

const FurnitureSEO = ({ route }) => {
  const { city } = route;
  const title = {
    sydney: 'Shop for Modern Furniture <br/> Online in Sydney',
    melbourne: 'Modern Furniture Online <br /> Shop in Melbourne',
  };
  const intro = {
    sydney:
      'Shopping for furniture shouldn’t be hard. We’ve made it easy for you.<br /><br /> Castlery’s furniture is designed for the modern home and delivered right to your doorstep in Sydney.<br /><br /> <a href="/au">Shop online with us</a> for our selection of couches, lounges, TV consoles, bed frames, dining chairs and more today.',
    melbourne:
      'Castlery’s furniture is designed for the Melbourne home and delivered right to your doorstep. <br /><br /> Between our stunning styles and fuss-free online shopping experience,your home will be looking stylish in no time.<br /><br /> <a href="/au">Shop online with us</a> for our selection of couches, lounges, TV consoles,bed frames, dining chairs and more today.',
  };
  const shipping = {
    sydney: 'Capped Shipping to Sydney<br />Metro from $29 per Order',
    melbourne: 'Capped Shipping to Melbourne<br />Metro from $29 per Order',
  };
  const points = [
    {
      icon: returnSVG,
      title: '14-Day Easy Returns',
      mobileTitle: '14-Day Easy Returns',
    },
    {
      icon: shippingSVG,
      title: shipping[city],
      mobileTitle: shipping[city],
    },
    {
      icon: swatchSVG,
      title: 'Free Swatches',
      mobileTitle: 'Free Swatches',
    },
  ];
  const categorySections = {
    sydney: {
      title: 'Quality Designs – <br />Direct to Your Sydney Home.',
      intro: 'Thoughtfully-crafted furniture at accessible prices for every room in your home.',
      categories: [
        {
          image: '/static/furniture-seo/sydney/living-room.jpg',
          key: 'all-living-room',
          name: 'Living Room Furniture >',
        },
        {
          image: '/static/furniture-seo/sydney/dining-room.jpg',
          key: 'all-dining-room',
          name: 'Dining Room Furniture >',
        },
        {
          image: '/static/furniture-seo/sydney/bedroom.jpg',
          key: 'all-bedroom',
          name: 'Bedroom Furniture >',
        },
        {
          image: '/static/furniture-seo/sydney/storage.jpg',
          key: 'all-storage',
          name: 'Storage Furniture >',
        },
      ],
    },
    melbourne: {
      title: 'Quality Furniture – <br />Direct to Your Melbourne Home.',
      intro: 'Well-crafted designs at accessible prices for every room in your home.',
      categories: [
        {
          image: '/static/furniture-seo/melbourne/living-room.jpg',
          key: 'all-living-room',
          name: 'Living Room Furniture >',
        },
        {
          image: '/static/furniture-seo/melbourne/dining-room.jpg',
          key: 'all-dining-room',
          name: 'Dining Room Furniture >',
        },
        {
          image: '/static/furniture-seo/melbourne/bedroom.jpg',
          key: 'all-bedroom',
          name: 'Bedroom Furniture >',
        },
        {
          image: '/static/furniture-seo/melbourne/storage.jpg',
          key: 'all-storage',
          name: 'Storage Furniture >',
        },
      ],
    },
  };
  const categorySection = categorySections[city];
  const DYCampaigns = {
    sydney: 'LP Furniture SEO (Syd)',
    melbourne: 'LP Furniture SEO (Mel)',
  };

  const collections = [
    {
      image: '/static/furniture-seo/adams-collection.jpg',
      mobileImage: '/static/furniture-seo/adams-collection-mobile.jpg',
      desc: '“Great sofa and even greater delivery and set-up service! I was also impressed by the fact it arrived with dust covers instead of being wrapped in plastic or cling wrap.”',
      author: '- Castlery Customer',
      actionText: 'Shop Adams',
      actionLink: 'adams-collection',
    },
    {
      image: '/static/furniture-seo/todd-collection-v2.jpg',
      mobileImage: '/static/furniture-seo/todd-collection-mobile.jpg',
      desc: '“The Todd sectional chaise sofa was very easy to put together and we really like how comfortable it is. It fits perfect in our small apartment.”',
      author: '- Sarah B.',
      actionText: 'Shop Todd',
      actionLink: 'todd-collection',
    },
    {
      image: '/static/furniture-seo/vincent-collection.jpg',
      mobileImage: '/static/furniture-seo/vincent-collection-mobile.jpg',
      desc: '“Vincent’s an incredible table - really sturdy and easy to assemble. The colour and style was exactly what I wanted.”',
      author: '- Michael L.',
      actionText: 'Shop Vincent',
      actionLink: 'vincent-collection',
    },
    {
      image: '/static/furniture-seo/seb-collection-v2.jpg',
      mobileImage: '/static/furniture-seo/seb-collection-mobile.jpg',
      desc: '“We’d had the bed for over a year now and it has been one of our best purchases ever! It’s really sturdy and goes so well with our decor.”',
      author: '- Castlery Customer',
      actionText: 'Shop Seb',
      actionLink: 'seb-collection',
    },
  ];
  const visualiseCopy = {
    sydney:
      'Powered by augmented reality (AR), our new, all-in-one shopping app lets you preview designs in your space and checkout in just a few easy taps.',
    melbourne:
      'Powered by augmented reality (AR), our new, all-in-one shopping app lets you preview designs in your Melbourne home and checkout in just a few easy taps.',
  };

  return (
    <div className={style.furnitureSEO}>
      <div className={`${style.furnitureSEO}__wrapper`}>
        <Container>
          <Banner
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: '/static/furniture-seo/banner-mobile.jpg',
                loader: { ratio: '0.81333' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/furniture-seo/banner.jpg',
                loader: { ratio: '0.3125' },
              },
            ]}
            lazy={false}
            title={title[city]}
          >
            <h1
              className={`${style.furnitureSEO}__title`}
              dangerouslySetInnerHTML={{
                __html: title[city],
              }}
            />
          </Banner>
        </Container>

        <div className={`${style.furnitureSEO}__intro`}>
          <div
            className={`${style.furnitureSEO}__intro-detail`}
            dangerouslySetInnerHTML={{
              __html: intro[city],
            }}
          />
        </div>

        <Container maxWidth="md">
          <div className={`${style.furnitureSEO}__section--usp`}>
            <SellingPoint points={points} className={`${style.furnitureSEO}__points`} />
          </div>

          <div className={`${style.furnitureSEO}__section--lg`}>
            <h2
              className={`${style.furnitureSEO}__heading`}
              dangerouslySetInnerHTML={{
                __html: categorySection.title,
              }}
            />
            <div className={`${style.furnitureSEO}__desc`}>{categorySection.intro}</div>
            <div className={`${style.furnitureSEO}__category__container`}>
              {categorySection.categories.map((category) => (
                <div key={category.key} className={`${style.furnitureSEO}__category`}>
                  {renderImage(category.image, 0.8339, 0.25, {
                    alt: category.name,
                  })}
                  <Link className={`${style.furnitureSEO}__category__name`}>{category.name}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* <DYWrapper
            campaign={DYCampaigns[city]}
            render={(selector) => (
              <div className={`${style.furnitureSEO}__section`}>
                <div
                  id={selector}
                  className={`${style.furnitureSEO}__recommendations`}
                />
              </div>
            )}
          /> */}

          <div className={`${style.furnitureSEO}__section`}>
            <div className={`${style.furnitureSEO}__recommendations`} data-campaign={DYCampaigns[city]} />
          </div>

          <div className={`${style.furnitureSEO}__section`}>
            <h2 className={`${style.furnitureSEO}__heading`}>
              Online Purchases,
              <br /> Real-Life Happiness.
            </h2>
            <div className={`${style.furnitureSEO}__desc`}>
              They shopped it and they liked it. See why {city.charAt(0).toUpperCase() + city.slice(1)} home lovers
              choose Castlery <Link to={getUrl('reviews')}>here</Link>.
            </div>
            <div className={`${style.furnitureSEO}__collections`}>
              {collections.map((collection, index) => (
                <div key={collection.image} className={`${style.furnitureSEO}__collection`}>
                  <ImageSection
                    image={{
                      url: collection.image,
                      ratio: 0.8928,
                      width: 0.3,
                    }}
                    mobileImage={{
                      url: collection.mobileImage,
                      ratio: 0.688,
                      width: 0.5,
                    }}
                    desc={collection.desc}
                    author={collection.author}
                    actionLink={getUrl(collection.actionLink)}
                    actionText={collection.actionText}
                    imageOnLeft={index % 2 === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={`${style.furnitureSEO}__section`}>
            <h2 className={`${style.furnitureSEO}__heading`}>Visualise Your Dream Space.</h2>
            <ImageSection
              image={{
                url: '/static/stay-home/app-au.jpg',
                ratio: 0.8415,
                width: 0.5,
              }}
              mobileImage={{
                url: '/static/stay-home/app-au-mobile.jpg',
                ratio: 0.8586,
                width: 0.5,
              }}
              desc={visualiseCopy[city]}
              actionText="Learn More >"
              actionLink={getUrl('app')}
              imageOnLeft
              isTextLink
              className={`${style.furnitureSEO}__app`}
            />
          </div>
        </Container>
      </div>
    </div>
  );
};

FurnitureSEO.propTypes = {
  route: PropTypes.object,
};

export default wrapPage()(FurnitureSEO);
