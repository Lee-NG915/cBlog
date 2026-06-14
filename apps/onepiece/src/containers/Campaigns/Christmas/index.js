import React from 'react';
import { Link } from 'react-router';

import Banner from 'components/Banner';
import CampaignItem from 'components/CampaignItem';

import { wrapPage } from 'utils/page';
import { getPageByKey } from 'pages';
import { renderImage } from 'utils/image';
import { getLinkWithQuery } from 'utils/link';

import { Container } from '@castlery/fortress';
import { getUserDevice } from 'utils/device';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const device = getUserDevice();
const SECTIONS = [
  {
    title: 'Cosy up with loved ones',
    links: [
      {
        key: '3-seater-sofas',
      },
      {
        key: 'sectional-sofas',
      },
      {
        key: 'armchairs',
      },
      {
        key: 'coffee-tables',
      },
      {
        key: 'living-room',
        type: 'all',
      },
    ],
  },
  {
    title: 'Make mealtimes merry',
    links: [
      {
        key: 'dining-tables',
      },
      {
        key: 'dining-chairs',
      },
      {
        key: 'dining-room-bundles',
      },
      {
        key: 'storage-shelves',
      },
      {
        key: 'dining-room',
        type: 'all',
      },
    ],
  },
  {
    title: 'Sweeter dreams this season',
    links: [
      {
        key: 'bedframes',
      },
      {
        key: 'bedside-tables',
      },
      {
        key: 'dressers-sideboards',
      },
      {
        key: 'bedroom-bundles',
      },
      {
        key: 'bedroom',
        type: 'all',
      },
    ],
  },
  {
    title: 'Decorate in style',
    links: [
      {
        key: 'all-rugs',
      },
      {
        key: 'all-mirrors',
      },
      {
        key: 'all-lighting',
      },
      {
        key: 'all-poufs-cushions-throws',
      },
      {
        key: 'accessories',
        type: 'all',
      },
    ],
  },
];

const CAMPAIGNS = [
  {
    key: 'xmas-sale',
    title: 'Christmas Sale',
    desc: 'Enjoy up to 30% off popular styles',
    img: {
      src: 'static/christmas/xmas-sale.jpg',
      ratio: 0.6087,
      widthRate: device === 'desktop' ? 0.3333 : 1,
    },
  },
  {
    key: 'express-delivery',
    title: 'In Time for Christmas',
    desc: 'Shop items delivered before Christmas',
    img: {
      src: 'static/christmas/express-delivery.jpg',
      ratio: 0.6087,
      widthRate: device === 'desktop' ? 0.3333 : 1,
    },
  },
  {
    key: 'gift-ideas',
    title: 'Gifting with Castlery',
    desc: 'Out of ideas? Browse gifts for christmas',
    img: {
      src: 'static/christmas/gift-ideas.jpg',
      ratio: 0.6087,
      widthRate: device === 'desktop' ? 0.3333 : 1,
    },
  },
];
const Christmas = () => {
  const { desktop } = useBreakpoints();
  const platform = desktop ? 'desktop' : 'mobile';
  return (
    <div className={style.christmas}>
      <div className={`${style.christmas}__wrapper`}>
        <Container>
          <Banner
            className={`${style.christmas}__banner`}
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: '/static/christmas/christmas-banner-mobile-sm.jpg',
                loader: { ratio: '0.533333333' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/christmas/christmas-banner-desktop-sm.jpg',
                loader: { ratio: '0.29375' },
              },
            ]}
            lazy={false}
            title="Christmas Sale"
          />
          <div className={`${style.christmas}__intro`}>
            <h2 className={`${style.christmas}__intro-title`}>Home for the Holidays</h2>
            <div className={`${style.christmas}__intro-detail`}>
              Spruce your home this jolly season! Enjoy <strong>up to 30% off</strong> popular designs across living,
              dining, bedroom and home accessories.
              <br />
              <br />
              Want them fast? Scroll down to shop items delivered <strong>In Time for Christmas!</strong>
            </div>
          </div>
          <div className={`${style.christmas}__sections`}>
            {SECTIONS.map((section) => (
              <div key={section.title} className={`${style.christmas}__section`}>
                <h3 className={`${style.christmas}__section-title`}>{section.title}</h3>
                <div className={`${style.christmas}__link-container`}>
                  {section.links.map((link) => {
                    const linkedPage = getPageByKey(link.key);
                    if (link.type === 'all') {
                      return (
                        <div key={link.key} className={`${style.christmas}__link--all`}>
                          <Link
                            to={getLinkWithQuery('/all-products', {
                              'category[0]': link.key,
                              'tags[0]': 'clearance',
                              'tags[1]': 'sale',
                            })}
                          >
                            {renderImage(
                              `static/christmas/${link.key}-${platform}.jpg`,
                              desktop ? 0.6667 : 0.4058,
                              desktop ? 0.2 : 1,
                              { alt: linkedPage.name }
                            )}
                          </Link>
                          <h4 className={`${style.christmas}__link-title`}>All {linkedPage.name}</h4>
                        </div>
                      );
                    }
                    return (
                      <div key={link.key} className={`${style.christmas}__link`}>
                        <Link
                          to={getLinkWithQuery(linkedPage.url, {
                            'tags[0]': 'clearance',
                            'tags[1]': 'sale',
                          })}
                        >
                          {renderImage(`static/christmas/${link.key}.jpg`, 0.6667, 0.2, { alt: linkedPage.name })}
                        </Link>
                        <h4 className={`${style.christmas}__link-title`}>{linkedPage.name}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={`${style.christmas}__campaigns`}>
            <h2 className={`${style.christmas}__campaigns-title`}>Be Festive Ready</h2>
            <div className={`${style.christmas}__campaigns-container`}>
              {CAMPAIGNS.map((campaign) => (
                <CampaignItem key={campaign.key} campaign={campaign} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default wrapPage()(Christmas);
