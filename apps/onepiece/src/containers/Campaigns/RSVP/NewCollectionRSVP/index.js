import React from 'react';
import PropTypes from 'prop-types';
import { withUseBreakpoints, wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';
import { Link } from 'react-router';
import { getUrl } from 'pages';

import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class NewCollectionRSVP extends React.PureComponent {
  static contextTypes = {
    frame: PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoints: PropTypes.object,
  };

  render() {
    const {
      breakpoints: { desktop },
    } = this.props;
    const images = desktop
      ? [
          {
            label: 'New Leather Range',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154451/marketing/SG/201906/NewCollection_New_Leather_Range.jpg',
          },
          {
            label: 'Trendy Velvet Colours',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154453/marketing/SG/201906/NewCollection_Trendy_Velvet_Colours.jpg',
          },
          {
            label: 'Solid Woods',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154451/marketing/SG/201906/NewCollection_Solid_Woods.jpg',
          },
          {
            label: 'Designer Series',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154451/marketing/SG/201906/NewCollection_Designer_Series.jpg',
          },
        ]
      : [
          {
            label: 'New Leather Range',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154452/marketing/SG/201906/NewCollection_New_Leather_Range_Mobile.jpg',
          },
          {
            label: 'Trendy Velvet Colours',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154452/marketing/SG/201906/NewCollection_Trendy_Velvet_Colours_Mobile.jpg',
          },
          {
            label: 'Solid Woods',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154451/marketing/SG/201906/NewCollection_Solid_Woods_Mobile.jpg',
          },
          {
            label: 'Designer Series',
            imageSrc:
              'https://res.cloudinary.com/castlery/image/upload/v1560154453/marketing/SG/201906/NewCollection_Designer_Series_Mobile.jpg',
          },
        ];

    const prizes = [
      {
        name: `Grand${desktop ? '<br />' : ' '}Prize`,
        desc: `$1,000${desktop ? '<br />' : ' '}Voucher`,
        quantity: 1,
      },
      {
        name: `2nd${desktop ? '<br />' : ' '}Prize`,
        desc: `$500${desktop ? '<br />' : ' '}Voucher`,
        quantity: 2,
      },
      {
        name: `3rd${desktop ? '<br />' : ' '}Prize`,
        desc: `$100${desktop ? '<br />' : ' '}Voucher`,
        quantity: 20,
      },
    ];

    const getRSVPBtn = (className) => (
      <div className={`${className}__action ${style.section}`}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            this.context.frame.openModal('appointment', {
              skipIntro: true,
              studioTitle: 'New Collection RSVP',
              date: '2019-06-15',
              days: 2,
              studioBtnText: 'RSVP Now',
              studioBtnStyle: 'btn-primary',
              confirmBtnText: 'Submit',
              confirmBtnStyle: 'btn-primary',
              pixelName: 'NR201906',
              eventLabel: 'NR201906',
              showTerms: true,
              eventId: { 'Jit Poh Studio': 6, 'The Grandstand Studio': 7 },
            })
          }
        >
          RSVP NOW
        </button>
      </div>
    );

    return (
      <div>
        {/* top banner */}
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1560139241/marketing/SG/201906/SG_Category_NewCollection_RSVP_Mobile.jpg',
              loader: { ratio: 0.6986 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1560149059/marketing/SG/201906/SG_Category_NewCollection_RSVP.jpg',
              loader: { ratio: 0.45 },
            },
          ]}
          lazy={false}
          title="New Collection RSVP"
        >
          <div className={style.header}>
            <p>New Collection Launch</p>
            <h1>More of What You Love</h1>
          </div>
        </Banner>
        <div className={style.intro}>
          <div className={`${style.intro}__detail ${style.section}`}>
            <div className={`${style.intro}__detail__date`}>
              <p>15 & 16 {desktop && <br />} June</p>
              <p> Sat & Sun, {desktop && <br />} 10am - 6pm </p>
            </div>
            <div className={`${style.intro}__detail__location`}>
              <h3>Location</h3>
              <div className={`${style.intro}__detail__studio`}>
                <h4>Jit Poh Studio</h4>
                <p>
                  19 Keppel Road,{!desktop && <br />} #02-06, Jit Poh Building
                  <br />
                  Singapore 089058
                </p>
              </div>

              <div className={`${style.intro}__detail__studio`}>
                <h4>The Grandstand Studio</h4>
                <p>
                  200 Turf Club Road,{!desktop && <br />} #03-07, The Grandstand
                  <br />
                  Singapore 287994
                </p>
              </div>

              <Link to={getUrl('studio')}>Studio Details ></Link>
            </div>
          </div>
        </div>

        {getRSVPBtn(style.intro)}

        <Container fixed>
          <div className={style.gallery}>
            {desktop ? (
              <h4>
                This weekend, come discover our new arrivals!
                <br />
                Enjoy refreshing treats while browsing our latest furniture and home accessories.
              </h4>
            ) : (
              <h4>Come discover new arrivals {!desktop && <br />} you’re sure to love!</h4>
            )}
            <div className={`${style.gallery}__features`}>
              {images.map((image) => (
                <div className={`${style.gallery}__feature`} key={image.label}>
                  <ReactPicture
                    srcset={image.imageSrc}
                    loader={{
                      ratio: !desktop ? 0.453 : 0.819,
                    }}
                    alt={image.label}
                  />
                  <div className={`${style.gallery}__label`}>{image.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>

        <div className={style.prizes}>
          <h4 className={`${style.prizes}__title`}>Plus, 23 prizes {!desktop && <br />} worth $4,000 to be won!</h4>
          <div className={`${style.prizes}__container`}>
            {prizes.map((prize) => (
              <div key={prize.name} className={`${style.prizes}__prize`}>
                <div className={`${style.prizes}__prize-title`}>
                  <div className={`${style.prizes}__prize-name`} dangerouslySetInnerHTML={{ __html: prize.name }} />
                </div>
                <div className={`${style.prizes}__prize-info`}>
                  <div className={`${style.prizes}__prize-detail`}>
                    <div className={`${style.prizes}__prize-desc`} dangerouslySetInnerHTML={{ __html: prize.desc }} />
                    <div className={`${style.prizes}__prize-quantity`}>x {prize.quantity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`${style.prizes}__hint`}>
            Get a chance to win when you RSVP or shop in-store this weekend. Winner will be chosen on Wednesday 19 June
            at 5pm.
          </div>
          {getRSVPBtn(style.prizes)}
          <div className={`${style.prizes}__notification`}>
            We’ll send you a reminder {!desktop && <br />} email & SMS with directions!
          </div>
        </div>
      </div>
    );
  }
}
