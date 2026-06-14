import React from 'react';
import { Link } from 'react-router';
import LazyLoad from 'react-lazyload';

import Banner from 'components/Banner';
import { VariantCollection, VariantCollectionBorder } from 'components/VariantCollection';
import { wrapPage } from 'utils/page';

import { Container } from '@castlery/fortress';
import style from './style.scss';

const LNY_PROMOTIONS = ['lny-highlights', 'lny-8'];
const TOP_VOTED_COLLECTIONS = ['888-sofas', '888-sideboards', '888-beds'];

const LunarNewYear = () => (
  <div className={style.lunarNewYear}>
    <div className={`${style.lunarNewYear}__wrapper`}>
      <Container>
        <Banner
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/static/lunar-new-year/2020/cny_banner_mobile_v2.jpg',
              loader: { ratio: '0.533333333' },
            },
            {
              breakpoint: 'lg',
              srcset: '/static/lunar-new-year/2020/cny_banner_desktop_v2.jpg',
              loader: { ratio: '0.29375' },
            },
          ]}
          lazy={false}
          title="Lunar New Year Sale"
        />

        <div className={`${style.lunarNewYear}__intro`}>
          <h2 className={`${style.lunarNewYear}__intro-title`}>Prosper This Lunar New Year</h2>
          <div className={`${style.lunarNewYear}__intro-detail`}>
            This Lunar New Year, enjoy prosperous savings with <strong>storewide $88 off</strong>
            <br />
            with min. $1,000 spend and selected items at <strong>8% off</strong> with code:{' '}
            <span className={`${style.lunarNewYear}__intro-coupon`}>LNY8</span>
            <br />
            <br />
            Plus, snag your top-voted designs at only <strong>$888</strong>!
          </div>
        </div>

        <div className={`${style.lunarNewYear}__promotions`}>
          {LNY_PROMOTIONS.map((promotionName) => (
            <div key={promotionName} className={`${style.lunarNewYear}__promotion`}>
              <LazyLoad offset={800} once height={600}>
                <VariantCollection name={promotionName} listName={`Lunar New Year Sale - ${promotionName}`} />
              </LazyLoad>
            </div>
          ))}
        </div>

        <div className={`${style.lunarNewYear}__topVoted`}>
          <Banner
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: '/static/lunar-new-year/2020/cny_top_sales_mobile_v2.jpg',
                loader: { ratio: '0.8' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/lunar-new-year/2020/cny_top_sales_desktop_v2.jpg',
                loader: { ratio: '0.208333' },
              },
            ]}
            lazy={false}
            title="Lunar New Year Top Voted Sales"
          />

          <div className={`${style.lunarNewYear}__topVoted-collections`}>
            {TOP_VOTED_COLLECTIONS.map((collectionName) => (
              <div key={collectionName} className={`${style.lunarNewYear}__topVoted-collection`}>
                <LazyLoad offset={800} once height={600}>
                  <VariantCollectionBorder
                    name={collectionName}
                    listName={`Lunar New Year Top Voted Sale - ${collectionName}`}
                  />
                </LazyLoad>
              </div>
            ))}

            <Link to="/sale" className={`btn ${style.lunarNewYear}__topVoted-action`}>
              Shop All Sale
            </Link>
          </div>
        </div>
      </Container>
    </div>
  </div>
);

export default wrapPage()(LunarNewYear);
