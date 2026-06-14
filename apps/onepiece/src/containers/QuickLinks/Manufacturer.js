import React from 'react';
import { wrapPage } from 'utils/page';
import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot } from 'config';
import LazyLoad from 'react-lazyload';
import classNames from 'classnames';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const Manufacturer = () => {
  const { desktop } = useBreakpoints();
  const data = [
    {
      type: 'banner',
      mobileImage: '/v1497531768/static/manufacturing-quality/mq-2-mobile.jpg',
      desktopImage: '/v1497515044/static/manufacturing-quality/mq-1.jpg',
      mobileColor: '#fff',
      mobileBg: '#BC8B66',
      title: 'SOFA & Upholstery',
      detail:
        'Upholstery is the core of Castlery. We are proud to deliver products ' +
        'made with the best materials and that uphold the highest quality standards.',
    },
    {
      type: '2ColBanner',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-3-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-2.jpg',
        ratio: 1.0409836,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-3.jpg',
        ratio: 1,
      },
      title: 'Best in Class<br>Solid Wood Frame',
      detail:
        'We have developed a high quality standard towards making of our frames. ' +
        'All timbers are sourced legally from certified channels, and by ' +
        'adding additional glue we can ensure your furniture will last the test of time.',
    },
    {
      type: '2ColBannerReverse',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-4-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-5.jpg',
        ratio: 1.0833,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-4.jpg',
        ratio: 0.9804,
      },
      title: 'Quality foam makes a quality product',
      detail:
        'We use top quality foam for our upholstered items. ' +
        'We use different densities to create the perfect comfort level for all our customers.',
    },
    {
      type: '2ColBanner',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-5-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-6.jpg',
        ratio: 0.9836,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-7.jpg',
        ratio: 1.0133,
      },
      title: 'Expert Craftsmanship',
      detail:
        "It's not enough to have a huge range of fantastic fabrics and leathers, " +
        'you also need expert craftsmen to stitch them together and spectacular quality ' +
        'control managers to make sure each and every stitch is perfect.',
    },
    {
      type: 'banner',
      mobileImage: '/v1497531768/static/manufacturing-quality/mq-6-mobile.jpg',
      desktopImage: '/v1497515044/static/manufacturing-quality/mq-8.jpg',
      mobileColor: '#fff',
      mobileBg: '#998776',
      title: 'Technology meets artisanal expertise',
      detail:
        'We use the latest technology such as steam bending, CNC cutting and straight-line ' +
        'sawing to achieve flawless results. Coupled with the best materials and machines, ' +
        'our products reflect utmost precision and craftsmanship.',
    },
    {
      type: '2ColBannerReverse',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-7-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-10.jpg',
        ratio: 1.1354,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-9.jpg',
        ratio: 0.905,
      },
      title: 'Wood Selection',
      detail:
        'We love timber and always choose the highest grade wood available, ' +
        'we also ensure all our timber is certified and legally sourced so we know ' +
        'we can rely on the quality.',
    },
    {
      type: '2ColBanner',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-8-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-11.jpg',
        ratio: 0.78489,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-12.jpg',
        ratio: 0.81637,
      },
      title: 'From Start to Finish',
      detail:
        'Castlery products get the best materials, care and quality control available. ' +
        'From wood selection, cutting, drilling, moisture control, assembly, to even the packaging, ' +
        'we don’t leave anything to chance.',
    },
    {
      type: 'banner',
      mobileImage: '/v1497531768/static/manufacturing-quality/mq-9-mobile.jpg',
      desktopImage: '/v1497515044/static/manufacturing-quality/mq-13.jpg',
      mobileColor: '#fff',
      mobileBg: '#B3B3B3',
      title: 'Mattresses',
      detail:
        'Our mattresses are created in world-class factories that have been tested, ' +
        'checked and certified by our expert team to bring you trusted quality and a good night’s sleep',
    },
    {
      type: '2ColBanner',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-10-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-14.jpg',
        ratio: 1.13636,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-15.jpg',
        ratio: 1.063655,
      },
      title: 'High Quality Production',
      detail:
        'All our mattresses are checked to the extent that we can give a 10-year warranty. ' +
        'We check the bounciness of the mattress, the firmness, the movement of the springs. ' +
        'Everything that ensures you get the sleep you deserve.',
    },
    {
      type: 'banner',
      mobileImage: '/v1497531768/static/manufacturing-quality/mq-11-mobile.jpg',
      desktopImage: '/v1497515044/static/manufacturing-quality/mq-16.jpg',
      mobileColor: '#fff',
      mobileBg: '#D0CDAD',
      title: 'Stringent Testing Process',
      detail:
        'Safety is a big part of any Castlery product. ' +
        'We conduct stringent in-house tests and professional lab tests to ensure stability and durability.',
    },
    {
      type: '2ColBanner',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-12-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-17.jpg',
        ratio: 1.008,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-18.jpg',
        ratio: 0.88,
      },
      title: 'Raw Material that matters',
      detail:
        'Selecting and working with the right material is the key to building a great product. ' +
        'We test them to ensure high performance throughout their life span.',
    },
    {
      type: '2ColBannerReverse',
      image1: {
        src: '/v1497531768/static/manufacturing-quality/mq-13-mobile.jpg',
        ratio: 0.9173,
      },
      image2: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-20.jpg',
        ratio: 0.9831,
      },
      image3: {
        src: '/f_auto,q_auto/v1497452664/static/manufacturing-quality/mq-19.jpg',
        ratio: 0.727,
      },
      title: 'High Intensity Testing',
      detail:
        'We believe that quality should be a standard of all Castlery items, ' +
        "that's why we go through several rounds of testing before we mass produce an item.",
    },
    {
      type: 'banner',
      mobileImage: '/v1497531768/static/manufacturing-quality/mq-14-mobile.jpg',
      desktopImage: '/v1497515044/static/manufacturing-quality/mq-21.jpg',
      mobileColor: '#fff',
      mobileBg: '#647680',
      title: 'Quality Control at Every Step',
      detail:
        'We have a dedicated in-house quality team that meticulously hand inspects every ' +
        'stitch, timber joint and detail to ensure you get the quality item you ordered.',
    },
  ];

  return (
    <div className={style.manufacturer}>
      {/* banner 1 */}
      <Container className={`${style.manufacturer}__banner ${style.manufacturer}__banner--video`}>
        <LazyLoad offset={500} once>
          {desktop ? (
            <div className={`${style.manufacturer}__banner__video`}>
              <video playsInline autoPlay muted loop>
                <source
                  src="https://s3-ap-southeast-2.amazonaws.com/knight-au-prod/static/Castlery-M_Q.webm"
                  type="video/webm"
                />
                <source
                  src="https://s3-ap-southeast-2.amazonaws.com/knight-au-prod/static/Castlery-M_Q.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          ) : (
            <ReactPicture
              srcset={`${cloudinaryRoot}/v1497531768/static/manufacturing-quality/mq-1-mobile.jpg`}
              className={`${style.manufacturer}__banner__image`}
              alt="world-class manufacturing"
              loader={{ ratio: 0.8, widths: [640, 960, 1280, 1440, 1920] }}
              lazy={false}
            />
          )}
        </LazyLoad>
        <div className={`${style.manufacturer}__banner__content`}>
          <h1>World-Class Manufacturing</h1>
          <p>
            Castlery has built a strong global supply chain of the finest manufacturers in the region. We take pride in
            designing, developing and manufacturing high quality products at their most transparent value.
          </p>
        </div>
      </Container>

      {data.map((d, index) => {
        // display as a banner
        if (d.type === 'banner') {
          return (
            <Container key={index} className={`${style.manufacturer}__banner`}>
              {desktop ? (
                <ReactPicture
                  srcset={`${cloudinaryRoot}${d.desktopImage}`}
                  className={`${style.manufacturer}__banner__image`}
                  alt={d.title}
                  loader={{
                    ratio: 0.45,
                    widths: [960, 1280, 1440, 1920, 2880],
                  }}
                  lazy={index !== 0}
                />
              ) : (
                <ReactPicture
                  srcset={`${cloudinaryRoot}${d.mobileImage}`}
                  className={`${style.manufacturer}__banner__image`}
                  alt={d.title}
                  loader={{ ratio: 0.8, widths: [640, 960, 1280, 1440, 1920] }}
                  lazy={index !== 0}
                />
              )}

              <div
                style={{ color: d.mobileColor, backgroundColor: d.mobileBg }}
                className={`${style.manufacturer}__banner__content`}
              >
                <h2>{d.title}</h2>
                <p>{d.detail}</p>
              </div>
            </Container>
          );
        }
        // display as a two column banner
        return (
          <div
            key={index}
            className={classNames(`${style.small} ${style.manufacturer}__2ColBanner`, {
              [`${style.manufacturer}__2ColBanner--reverse`]: d.type === '2ColBannerReverse',
            })}
          >
            {!desktop && (
              <div className={`${style.manufacturer}__2ColBanner__mobileImage`}>
                <ReactPicture
                  srcset={`${cloudinaryRoot}${d.image1.src}`}
                  alt={d.title}
                  loader={{ ratio: d.image1.ratio }}
                />
              </div>
            )}
            <div className={`${style.manufacturer}__2ColBanner__pureImage`}>
              <ReactPicture
                alt={`${d.title} 1`}
                loader={{ ratio: d.image2.ratio }}
                src={`${cloudinaryRoot}${d.image2.src}`}
              />
            </div>
            <div className={`${style.manufacturer}__2ColBanner__content`}>
              <div className={`${style.manufacturer}__2ColBanner__content__img`}>
                <ReactPicture
                  loader={{ ratio: d.image3.ratio }}
                  alt={`${d.title} 2`}
                  src={`${cloudinaryRoot}${d.image3.src}`}
                />
              </div>

              <h3 dangerouslySetInnerHTML={{ __html: d.title }} />
              <p>{d.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default wrapPage()(Manufacturer);
