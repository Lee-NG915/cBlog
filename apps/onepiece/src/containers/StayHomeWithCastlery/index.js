import React from 'react';
import { Link } from 'react-router';

import Banner from 'components/Banner';
import { wrapPage } from 'utils/page';
import { renderImage } from 'utils/image';

import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { enableDisplayNorthAmerica, globalFeatureInSG } from 'config';
import style from './style.scss';

const StayHomeWithCastlery = () => {
  const { desktop: isDesktop } = useBreakpoints();
  const displayNorthAmerica = __COUNTRY__ === 'US' || __COUNTRY__ === 'CA';
  let campaigns = [
    {
      key: 'app',
      isSpanned: true,
      sequence: [
        { name: 'image', width: 680 },
        { name: 'body', width: 450 },
      ],
      image: {
        url: `/static/web-ar/AR-prompt.jpg`,
        ratio: isDesktop ? 0.8415 : 0.8586,
        width: isDesktop ? 0.5 : 1,
      },
      title: enableDisplayNorthAmerica ? 'Visualize in real life' : 'Visualise in real life.',
      desc: (
        <>
          Powered by augmented reality, our{' '}
          <Link target="_blank" to="/web-ar">
            Web AR
          </Link>{' '}
          feature allows you to picture our designs in your home - at your fingertips.
        </>
      ),
      cta_link: '/web-ar',
      cta_text: 'Learn More >',
    },
  ];

  if (globalFeatureInSG) {
    campaigns = campaigns.concat([
      {
        key: 'virtual-studio',
        isSpanned: true,
        sequence: isDesktop
          ? [
              { name: 'body', width: 600 },
              { name: 'image', width: 530 },
            ]
          : [
              { name: 'image', width: 530 },
              { name: 'body', width: 600 },
            ],
        image: {
          url: `/static/stay-home/virtual-studio${isDesktop ? '' : '-mobile'}.jpg`,
          ratio: isDesktop ? 0.625 : 0.688,
          width: isDesktop ? 0.25 : 1,
        },
        title: 'Explore our Virtual Studio.',
        desc: '‘Walk through’ our Jit Poh studio and browse our products from the comfort of your home (and pyjamas!)',
        cta_link: '/virtual-studio',
        cta_text: 'Explore >',
      },
    ]);
  }

  const sales = [
    {
      key: 'work-from-home',
      isSpanned: !displayNorthAmerica,
      image: {
        url:
          enableDisplayNorthAmerica && isDesktop
            ? `/v1588234195/static/stay-home/work-from-home-us.jpg`
            : `/static/stay-home/work-from-home${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? (enableDisplayNorthAmerica ? 0.7297 : 0.625) : 0.688,
        width: isDesktop ? 0.5 : 1,
      },
      title: 'Work from home, easy',
      desc: enableDisplayNorthAmerica
        ? 'Keep distractions at bay; double up the dining table as a workspace or get one as a work desk (spacious enough for your computer, files and more!)'
        : 'We know the feeling — the kettle’s boiling and the bed’s calling. Keep distractions at bay with the right furniture; sometimes it’s turning the dining table into a workspace for the day or getting one as a work desk (it’s spacious enough for your computer, files and more!)',
      cta_link: '/work-from-home',
      cta_text: 'Shop Now >',
    },
    {
      key: 'family-time',
      image: {
        url: `/static/stay-home/sales/family-time${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.7297 : 0.688,
        width: isDesktop ? 0.25 : 1,
      },
      title: 'Gather the family ',
      desc: 'The kids are now home all day! Bond over boardgames and movie marathons. We recommend modular layouts and ultra-cushy seating to make nights in more enjoyable.',
      cta_link: '/family-time',
      cta_text: 'Shop Now >',
    },
    {
      key: 'dine-in',
      image: {
        url: `/static/stay-home/sales/dine-in${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.7297 : 0.688,
        width: isDesktop ? 0.25 : 1,
      },
      title: 'Dine in better',
      desc: 'With more eating in, the right ambience can really whet an appetite and lift your spirits after a long day. Feast your eyes on the best of dining.',
      cta_link: '/dine-in',
      cta_text: 'Shop Now >',
    },
    {
      key: 'stay-in-bed',
      image: {
        url: `/static/stay-home/sales/stay-in-bed${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.7297 : 0.688,
        width: isDesktop ? 0.25 : 1,
      },
      title: 'Stay in bed',
      desc: enableDisplayNorthAmerica
        ? 'We’re all snoozing in more lately and an inviting bedroom is key to feeling energized (even if it’s hard to get out of bed).'
        : 'We’re all snoozing in more these days and an inviting bedroom is the key to feeling rejuvenated (even if it’s hard to get out of bed). Browse bedroom staples now.',
      cta_link: '/stay-in-bed',
      cta_text: 'Shop Now >',
    },
    {
      key: 'storage',
      image: {
        url: `/static/stay-home/sales/storage${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.7297 : 0.688,
        width: isDesktop ? 0.25 : 1,
      },
      title: enableDisplayNorthAmerica ? 'Get organized' : 'Get organised',
      desc: 'A clear head starts with a clear space. You’d be surprised how a little decluttering can help transform your home.',
      cta_link: '/storage/all-storage',
      cta_text: 'Shop Now >',
    },
    {
      key: 'chill-corner',
      image: {
        url: `/static/stay-home/sales/chill-corner${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.7297 : 0.688,
        width: isDesktop ? 0.25 : 1,
      },
      title: 'Remember to chill',
      desc: 'Indulge in some self-care, whether it’s reclining in an armchair with a book or finding a quiet corner to stretch.',
      cta_link: '/chill-corner',
      cta_text: 'Shop Now >',
    },
  ];

  if (!enableDisplayNorthAmerica) {
    sales.push({
      key: 'get-comfy',
      image: {
        url: `/static/stay-home/sales/get-comfy${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.7297 : 0.688,
        width: isDesktop ? 0.25 : 1,
      },
      title: 'Little steps to comfort',
      desc: 'It’s all in the details. Adding a pouf or laying out a rug softens your home instantly and makes it so much more inviting.',
      cta_link: '/get-comfy',
      cta_text: 'Shop Now >',
    });
  }

  const services = [
    {
      key: 'delivery',
      image: {
        url: `/static/stay-home/delivery${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.625 : 0.688,
        width: isDesktop ? 0.5 : 1,
      },
      title: 'Contactless Delivery',
      desc: 'You may now opt for self-assembly and our delivery partners will place your unassembled item(s) at your doorstep upon arrival. ',
      cta_link: '/delivery',
      cta_text: 'Learn More >',
    },
    {
      key: 'disposal',
      image: {
        url: `/static/stay-home/disposal${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.625 : 0.688,
        width: isDesktop ? 0.5 : 1,
      },
      title: 'Easy Disposal',
      desc: 'Out with the old, in with the new! We offer disposal of your old furniture (like-for-like items) for only a minimal fee.',
      cta_link: '/delivery',
      cta_text: 'Learn More >',
    },
    {
      key: 'free-storage',
      image: {
        url: `/static/stay-home/free-storage${isDesktop ? '' : '-mobile'}.jpg`,
        ratio: isDesktop ? 0.625 : 0.688,
        width: isDesktop ? 0.5 : 1,
      },
      title: 'Free Storage',
      desc: 'Can’t move in yet? Enjoy up to 2 months of free storage for your purchased items until you’re ready to have them delivered.  ',
      cta_link: '/delivery',
      cta_text: 'Learn More >',
    },
  ];
  return (
    <div className={style.stayHome}>
      <Container>
        <Banner
          className={`${style.stayHome}__banner`}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1587541243/static/stay-home/banner-mobile.jpg',
              loader: {
                ratio: 0.8133,
              },
            },
            {
              breakpoint: 'md',
              srcset: '/v1587541251/static/stay-home/banner.jpg',
              loader: {
                ratio: 0.3125,
              },
            },
          ]}
          lazy={false}
          title="At Home with Castlery"
        >
          <div className={`${style.stayHome}__header`}>
            <h1 className={`${style.stayHome}__header-title`}>At Home with Castlery</h1>
          </div>
        </Banner>
        <div className={`${style.stayHome}__intro`}>
          <div className={`${style.stayHome}__intro-detail`}>
            Staying in with the right furniture is now more important than ever. {isDesktop ? <br /> : ''}
            Here’s how we’re helping you shop easy from the comfort of your home!
          </div>
        </div>

        <Container maxWidth="md">
          <div className={`${style.stayHome}__container`}>
            <div className={`${style.stayHome}__campaigns`}>
              {campaigns.map((campaign) => (
                <div
                  key={campaign.key}
                  className={`${style.stayHome}__campaign ${
                    campaign.isSpanned ? `${style.stayHome}__campaign--spanned` : ''
                  }`}
                >
                  {campaign.sequence.map((item, i) => {
                    let widthStyle = null;
                    if (isDesktop && campaign.isSpanned) {
                      if (i + 1 === campaign.sequence.length) {
                        widthStyle = {
                          flex: `0 1 ${item.width}px`,
                          marginRight: 0,
                        };
                      } else {
                        widthStyle = {
                          flex: `0 1 ${item.width}px`,
                          marginRight: '30px',
                        };
                      }
                    }
                    if (item.name === 'image') {
                      return (
                        <div className={`${style.stayHome}__campaign-image`} style={widthStyle} key={i}>
                          {renderImage(campaign.image.url, campaign.image.ratio, campaign.image.width, {
                            alt: campaign.title,
                          })}
                        </div>
                      );
                    }
                    if (item.name === 'body') {
                      return (
                        <div key={i} className={`${style.stayHome}__campaign-body`} style={widthStyle}>
                          <h2 className={`${style.stayHome}__title`}>{campaign.title}</h2>
                          <div className={`${style.stayHome}__desc`}>{campaign.desc}</div>
                          <div className={`${style.stayHome}__cta`}>
                            <Link to={campaign.cta_link}>{campaign.cta_text}</Link>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Container>
      <div className={`${style.stayHome}__sales-container`}>
        <div className={`${style.stayHome}__sales-header`}>The key to feeling good? Setting the right mood.</div>
        <Container maxWidth="md">
          <div className={`${style.stayHome}__sales`}>
            {sales.map((sale) => (
              <div
                key={sale.key}
                className={`${style.stayHome}__sale ${sale.isSpanned ? `${style.stayHome}__sale--spanned` : ''}`}
              >
                <div className={`${style.stayHome}__sale-image`}>
                  {renderImage(sale.image.url, sale.image.ratio, sale.image.width, { alt: sale.title })}
                  <h2 className={`${style.stayHome}__title`}>{sale.title}</h2>
                </div>
                <div className={`${style.stayHome}__sale-body`}>
                  {sale.isSpanned && <h2 className={`${style.stayHome}__title`}>{sale.title}</h2>}
                  <div className={`${style.stayHome}__desc`}>{sale.desc}</div>
                  <div className={`${style.stayHome}__cta`}>
                    <Link to={sale.cta_link}>{sale.cta_text}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {globalFeatureInSG && (
        <Container maxWidth="md" className={`${style.stayHome}__services-container`}>
          <div className={`${style.stayHome}__services-header`}>Serving you better.</div>
          <div className={`${style.stayHome}__services`}>
            {services.map((service) => (
              <div key={service.key} className={`${style.stayHome}__service`}>
                <div className={`${style.stayHome}__service-image`}>
                  {renderImage(service.image.url, service.image.ratio, service.image.width, { alt: service.title })}
                </div>
                <div className={`${style.stayHome}__service-body`}>
                  <h2 className={`${style.stayHome}__title`}>{service.title}</h2>
                  <div className={`${style.stayHome}__desc`}>{service.desc}</div>
                  <div className={`${style.stayHome}__cta`}>
                    <Link to={service.cta_link}>{service.cta_text}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      )}
    </div>
  );
};

export default wrapPage()(StayHomeWithCastlery);
