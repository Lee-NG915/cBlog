import React from 'react';
import { Link } from 'react-router';
import { getUrl } from 'pages';
// import { priceBreakCampaigns } from 'config';
import { wrapPage } from 'utils/page';
import { isOutdated } from 'utils/time';
import Banner from 'components/Banner';
// import DYWrapper from 'components/DYWrapper';
import RetiredPage from 'components/RetiredPage';
import useCartMassagings from 'components/Cart/hooks/useCartMassagings';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { globalFeatureInSG, globalFeatureInUS } from 'config';
import { get } from '../../../helpers/Cookie';

import style from './style.scss';

let dyCampaign1 = '';
let dyCampaign2 = '';
switch (__COUNTRY__) {
  case 'SG':
    dyCampaign1 = 'LP Mid Year Sale (Bestseller)';
    dyCampaign2 = 'LP Mid Year Sale (Clearance)';
    break;
  case 'US':
    dyCampaign1 = 'LP Mid-Year Sale (Bestsellers)';
    dyCampaign2 = 'LP Mid-Year Sale (Clearance)';
    break;
  case 'AU':
    dyCampaign1 = 'LP EOFY (Bestsellers)';
    dyCampaign2 = 'LP EOFY (Clearance)';
    break;
  default:
}

const outdoor = [
  {
    cate: 'all-outdoor-furniture',
    deskStyle: 'd_cell_11_21',
    mobileStyle: 'm_cell_11_21x',
  },
  {
    cate: 'outdoor-lounge-furniture',
    deskStyle: 'd_cell_13_11',
    mobileStyle: 'm_cell_21_11x',
  },
  {
    cate: 'outdoor-dining-furniture',
    deskStyle: 'd_cell_21_11',
    mobileStyle: 'm_cell_22_11x',
  },
  {
    cate: 'outdoor-furniture-covers',
    deskStyle: 'd_cell_31_11',
    mobileStyle: 'm_cell_32_11x',
  },
  {
    cate: 'outdoor-furniture-sets',
    deskStyle: 'd_cell_22_22',
    mobileStyle: 'm_cell_31_11x',
  },
];
const livingRoom = globalFeatureInUS
  ? [
      {
        cate: 'all-living-room',
        deskStyle: 'd_cell_11_11',
        mobileStyle: 'm_cell_11_11',
      },
      {
        cate: 'all-sofas',
        deskStyle: 'd_cell_12_21',
        mobileStyle: 'm_cell_12_11',
      },
      {
        cate: 'coffee-tables',
        deskStyle: 'd_cell_21_11',
        mobileStyle: 'm_cell_21_11',
      },
      {
        cate: 'armchairs-accent-chairs',
        deskStyle: 'd_cell_22_11',
        mobileStyle: 'm_cell_22_11',
      },
      {
        cate: 'ottomans-poufs',
        deskStyle: 'd_cell_23_11',
        mobileStyle: 'm_cell_31_11',
      },
      {
        cate: 'tv-consoles',
        deskStyle: 'd_cell_31_11',
        mobileStyle: 'm_cell_32_11',
      },
      {
        cate: 'shelves-cabinets',
        deskStyle: 'd_cell_32_11',
        mobileStyle: 'm_cell_41_11',
      },
      {
        cate: 'side-tables',
        deskStyle: 'd_cell_33_11',
        mobileStyle: 'm_cell_42_11',
      },
    ]
  : [
      {
        cate: 'all-living-room',
        deskStyle: 'd_cell_11_11',
        mobileStyle: 'm_cell_11_11',
      },
      {
        cate: 'all-sofas',
        deskStyle: 'd_cell_12_21',
        mobileStyle: 'm_cell_12_11',
      },
      {
        cate: 'coffee-tables',
        deskStyle: 'd_cell_21_11',
        mobileStyle: 'm_cell_21_11',
      },
      {
        cate: 'armchairs',
        deskStyle: 'd_cell_22_11',
        mobileStyle: 'm_cell_22_11',
      },
      {
        cate: 'ottomans-poufs',
        deskStyle: 'd_cell_23_11',
        mobileStyle: 'm_cell_31_11',
      },
      {
        cate: 'tv-consoles',
        deskStyle: 'd_cell_31_11',
        mobileStyle: 'm_cell_32_11',
      },
      {
        cate: 'shelves-cabinets',
        deskStyle: 'd_cell_32_11',
        mobileStyle: 'm_cell_41_11',
      },
      {
        cate: 'side-tables',
        deskStyle: 'd_cell_33_11',
        mobileStyle: 'm_cell_42_11',
      },
    ];
const diningRoom = [
  {
    cate: 'all-dining-room',
    deskStyle: 'd_cell_11_21',
    mobileStyle: 'm_cell_11_11x',
  },
  {
    cate: 'dining-tables',
    deskStyle: 'd_cell_13_11',
    mobileStyle: 'm_cell_12_11x',
  },
  {
    cate: 'dining-chairs',
    deskStyle: 'd_cell_21_11',
    mobileStyle: 'm_cell_21_11x',
  },
  {
    cate: 'dining-benches',
    deskStyle: 'd_cell_22_21',
    mobileStyle: 'm_cell_22_11x',
  },
  {
    cate: 'stools-barstools',
    deskStyle: 'd_cell_31_21',
    mobileStyle: 'm_cell_31_11x',
  },
  {
    cate: 'storage-shelves',
    deskStyle: 'd_cell_33_11',
    mobileStyle: 'm_cell_32_11x',
  },
];
const bedroom = globalFeatureInUS
  ? [
      { cate: 'all-bedroom', deskStyle: 'd_cell_', mobileStyle: 'm_cell_' },
      { cate: 'beds', deskStyle: 'd_cell_', mobileStyle: 'm_cell_' },
      { cate: 'nightstands', deskStyle: 'd_cell_', mobileStyle: 'm_cell_' },
      {
        cate: 'bedroom-bundles',
        deskStyle: 'd_cell_',
        mobileStyle: 'm_cell_',
      },
      { cate: 'dressers', deskStyle: 'd_cell_', mobileStyle: 'm_cell_' },
    ]
  : [
      {
        cate: 'all-bedroom',
        deskStyle: 'd_cell_11_21',
        mobileStyle: 'm_cell_11_21x',
      },
      {
        cate: 'bedframes',
        deskStyle: 'd_cell_13_11',
        mobileStyle: 'm_cell_21_11x',
      },
      {
        cate: 'bedside-tables',
        deskStyle: 'd_cell_21_11',
        mobileStyle: 'm_cell_22_11x',
      },
      {
        cate: 'bedroom-bundles',
        deskStyle: 'd_cell_22_22',
        mobileStyle: 'm_cell_32_11x',
      },
      {
        cate: 'bedroom-storage',
        deskStyle: 'd_cell_31_11',
        mobileStyle: 'm_cell_31_11x',
      },
      {
        cate: 'dressers-sideboards',
      },
    ];
const storage = globalFeatureInUS
  ? [
      {
        cate: 'all-storage',
        deskStyle: 'd_cell_11_21',
        mobileStyle: 'm_cell_11_11x',
      },
      {
        cate: 'dressers',
        deskStyle: 'd_cell_13_11',
        mobileStyle: 'm_cell_12_11x',
      },
      {
        cate: 'tv-consoles',
        deskStyle: 'd_cell_21_11',
        mobileStyle: 'm_cell_21_11x',
      },
      {
        cate: 'side-tables',
        deskStyle: 'd_cell_31_11',
        mobileStyle: 'm_cell_22_11x',
      },
      {
        cate: 'sideboards-cabinets',
        deskStyle: 'd_cell_22_22',
        mobileStyle: 'm_cell_31_21x',
      },
    ]
  : [
      {
        cate: 'all-storage',
        deskStyle: 'd_cell_11_21',
        mobileStyle: 'm_cell_11_11x',
      },
      {
        cate: 'sideboards-cabinets',
        deskStyle: 'd_cell_13_11',
        mobileStyle: 'm_cell_12_11x',
      },
      {
        cate: 'dressers',
        deskStyle: 'd_cell_21_11',
        mobileStyle: 'm_cell_21_11x',
      },
      {
        cate: 'tv-consoles',
        deskStyle: 'd_cell_31_11',
        mobileStyle: 'm_cell_22_11x',
      },
      {
        cate: 'shelves-coat-racks',
        deskStyle: 'd_cell_22_22',
        mobileStyle: 'm_cell_31_21x',
      },
      {
        cate: 'shelves-cabinets',
      },
      {
        cate: 'dressers-sideboards',
      },
      { cate: 'side-tables' },
    ];
const categories = {
  outdoor,
  livingRoom,
  bedroom,
  diningRoom,
  storage,
};
const MidYearSale = () => {
  const priceBreakCampaigns = useCartMassagings();

  const { desktop } = useBreakpoints();
  // filter by title. If a breakCampaign had title, it could be used here
  const realPriceBreakCampaigns = priceBreakCampaigns.filter((item) => item.title);

  const insiderIndex = get('castlery_insider'); // used for showing sale page
  let priceBreakCampaign;
  if (['0', '1'].includes(insiderIndex)) {
    priceBreakCampaign = realPriceBreakCampaigns[parseInt(insiderIndex)];
  } else {
    priceBreakCampaign = realPriceBreakCampaigns.find((campaign) => !isOutdated(campaign.startDate, campaign.endDate));
    if (!priceBreakCampaign) {
      return <RetiredPage />;
    }
  }

  const { yearVersion, bannerImage, bannerImageMobile, regions } = priceBreakCampaign;

  return (
    <div className={style.birthdaySale}>
      <div className={`${style.birthdaySale}__wrapper`}>
        <Container>
          <Banner
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: bannerImageMobile,
                loader: { ratio: '0.81333' },
              },
              {
                breakpoint: 'lg',
                srcset: bannerImage,
                loader: { ratio: '0.3125' },
              },
            ]}
            lazy={false}
            title="Mid-Year Sale"
          >
            <h1 className={`${style.birthdaySale}__title`}>
              {!desktop ? priceBreakCampaign.mobileTitle : priceBreakCampaign.title}
            </h1>
          </Banner>
        </Container>

        <div className={`${style.birthdaySale}__intro`}>
          <div
            className={`${style.birthdaySale}__intro-detail`}
            dangerouslySetInnerHTML={{
              __html: priceBreakCampaign.copy,
            }}
          />
        </div>

        <Container maxWidth="md">
          <div className={`${style.birthdaySale}__section--xs`}>
            <div className={`${style.birthdaySale}__promotions`}>
              <Banner
                mediaQueries={[
                  {
                    breakpoint: 'xs',
                    srcset: priceBreakCampaign.promotionImageMobile,
                    loader: {
                      ratio: priceBreakCampaign.promotionImageMobileRatio || 0.5413,
                    },
                  },
                  {
                    breakpoint: 'lg',
                    srcset: priceBreakCampaign.promotionImage,
                    loader: {
                      ratio: priceBreakCampaign.promotionImageRatio || 0.0662,
                    },
                  },
                ]}
                lazy={false}
                title={`${priceBreakCampaign.campaignName} - Promotions`}
              />
            </div>
          </div>

          <div className={`${style.birthdaySale}__note`}>
            {priceBreakCampaign.terms || 'Discount applies automatically. T&Cs apply.'}
          </div>
        </Container>
        {((!isOutdated('2021-07-16 00:00', '2021-08-01 00:00') && globalFeatureInSG) || insiderIndex === '2') && (
          <Container className={`${style.birthdaySale}__extraBanner`}>
            <div className={`${style.birthdaySale}__extraBox`}>
              <div className={`${style.birthdaySale}__extraInnerBox`}>
                <span className={`${style.birthdaySale}__extraName`}>STUDIO EXCLUSIVE</span>
                <h1>Extra $50 off{'\n'}GSS Savings</h1>
                <p>With any min. spend of $1500.</p>
                <a href="/studio">Visit Our Studio &gt;</a>
              </div>
            </div>
            <div className={`${style.birthdaySale}__bannerImg`}>
              <Banner
                mediaQueries={[
                  {
                    breakpoint: 'xs',
                    srcset: '/static/mid-year-sale/sg/2021/extra-banner-mobile-2.jpg',
                    loader: {
                      ratio: 0.634,
                    },
                  },
                  {
                    breakpoint: 'lg',
                    srcset: '/static/mid-year-sale/sg/2021/extra-banner-desktop-2.jpg',
                    loader: {
                      ratio: 0.516,
                    },
                  },
                ]}
                lazy={false}
                title={`${priceBreakCampaign.campaignName} - studio exclusive`}
              />
            </div>
          </Container>
        )}
        {priceBreakCampaign.freeGift && (
          <Container>
            <div className={`${style.birthdaySale}__section`} data-campaign={priceBreakCampaign.freeGift} />
          </Container>
        )}

        <Container maxWidth="md">
          {regions.map((region, i) => {
            const { title, mobileTitle, category, mobileRatio, deskRatio } = region;
            const index = i + 1;
            return (
              <div key={index} className={`${style.birthdaySale}__section`}>
                <div className={`${style.birthdaySale}__region${index}`}>
                  <Banner
                    mediaQueries={[
                      {
                        breakpoint: 'xs',
                        srcset: `/static/mid-year-sale/${__COUNTRY__}/${yearVersion}/${index}-banner-mobile.jpg`,
                        loader: { ratio: 0.5333 },
                      },
                      {
                        breakpoint: 'lg',
                        srcset: `/static/mid-year-sale/${__COUNTRY__}/${yearVersion}/${index}-banner.jpg`,
                        loader: { ratio: 0.3418 },
                      },
                    ]}
                    lazy={false}
                    title={title}
                  >
                    <h2 className={`${style.birthdaySale}__subTitle`}>{!desktop ? mobileTitle : title}</h2>
                  </Banner>
                  <div className={`${style.birthdaySale}__section-container`}>
                    <Banner
                      mediaQueries={[
                        {
                          breakpoint: 'xs',
                          srcset: `/static/mid-year-sale/${__COUNTRY__}/${yearVersion}/${index}-link-mobile.png`,
                          loader: { ratio: mobileRatio },
                        },
                        {
                          breakpoint: 'lg',
                          srcset: `/static/mid-year-sale/${__COUNTRY__}/${yearVersion}/${index}-link.png`,
                          loader: { ratio: deskRatio },
                        },
                      ]}
                      lazy
                      title={title}
                    />
                    {categories[category].map((item) => (
                      <Link
                        key={item.cate}
                        className={!desktop ? `${item.mobileStyle}` : `${item.deskStyle}`}
                        to={getUrl(item.cate)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </Container>

        <Container>
          <div className={`${style.birthdaySale}__section`} data-campaign={dyCampaign1} />

          <div className={`${style.birthdaySale}__section`} data-campaign={dyCampaign2} />
        </Container>
      </div>
    </div>
  );
};

export default wrapPage()(MidYearSale);
