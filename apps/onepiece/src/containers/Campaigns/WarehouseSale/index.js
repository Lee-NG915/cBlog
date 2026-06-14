import React from 'react';
import PropTypes from 'prop-types';
import { withUseBreakpoints, wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';
import { Link } from 'react-router';
// import ResponsiveSlick from 'components/ResponsiveSlick';
// import { getBreakpoint, getWidth } from 'utils/breakpoints';

import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class WarehouseSale extends React.PureComponent {
  static contextTypes = {
    frame: PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoints: PropTypes.object,
  };

  // images = [
  //   'https://res.cloudinary.com/castlery/image/upload/v1553584378/marketing/SG/201903/past-1.jpg',
  //   'https://res.cloudinary.com/castlery/image/upload/v1542856639/marketing/SG/201811/past-2.jpg',
  //   'https://res.cloudinary.com/castlery/image/upload/v1553584378/marketing/SG/201903/past-3.jpg',
  // ];

  render() {
    const {
      breakpoints: { desktop },
    } = this.props;
    return (
      <div>
        {/* top banner */}
        <Banner
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1565880646/marketing/SG/201908/SG_Homepage_WHSale_Mobile.jpg',
              loader: { ratio: 0.81 },
            },
            {
              breakpoint: 'sm',
              srcset: '/v1565863297/marketing/SG/201908/SG_Homepage_WHSale_Tablet.jpg',
              loader: { ratio: 0.378 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1565945637/marketing/SG/201908/SG_Homepage_WHSale_Desktop.jpg',
              loader: { ratio: 0.416 },
            },
          ]}
          lazy={false}
          title="Warehouse Sale"
        />
        <div className={style.intro}>
          <div className={style.section}>
            <h3>Our Warehouse Sale is back!</h3>
            <p>For two days only,{!desktop && <br />} shop gigantic discounts from 40% to 60% off!</p>
            <p>
              Get up close with our huge selection of AS-IS furniture – from living and dining to storage and bedroom –
              at their lowest prices.
            </p>
            <p>Come early! Items are limited and on a first-come-first-serve basis.</p>
          </div>

          <div className={`${style.intro}__detail ${style.section}`}>
            <div className={`${style.intro}__detail__date`}>
              <p>
                24 & 25 Aug
                {desktop && (
                  <>
                    <br />
                    Sat – Sun
                  </>
                )}
              </p>
              <p>
                {!desktop && 'Sat & Sun, '}
                12pm - 6pm
                <br />
                (Or while stocks last)
              </p>
            </div>
            <div className={`${style.intro}__detail__map`}>
              {!desktop && (
                // eslint-disable-next-line jsx-a11y/iframe-has-title
                <iframe
                  src={
                    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.782581852383!' +
                    '2d103.73095816239179!3d1.3055560561889947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!' +
                    '4f13.1!3m3!1m2!1s0x31da1acb1946209d%3A0x1e55b82b3efd6324!2s42D+Penjuru+Rd!5e0!' +
                    '3m2!1sen!2ssg!4v1542859588594'
                  }
                  frameBorder="0"
                  style={{ border: 0, width: '100%', height: '300px' }}
                  allowFullScreen
                />
              )}
            </div>
            <div className={`${style.intro}__detail__location`}>
              <h3>Location</h3>
              <p>
                42D Penjuru Road, #03-01, {!desktop && <br />} HSL Waterfront @ Penjuru
                <br />
                Schnelle Antwort Integrated Logistics Pte Ltd
                <br />
                Singapore 609162
              </p>
              {desktop && (
                <>
                  <a href="https://goo.gl/maps/KQqbBW85KpBkQV9G9" target="_blank" rel="noopener">
                    Directions {'>'}
                  </a>
                  <br />
                  <br />
                </>
              )}
              <ul>
                <li>{desktop && 'Extremely'} Limited parking space available.</li>
                <li>Drop-offs or pick-up of passengers can be done at level 3. Waiting is not allowed.</li>
              </ul>
            </div>
          </div>

          <div className={`${style.intro}__highlight ${style.section}`}>
            <h4>Free Delivery on all orders!</h4>
            <p>Terms & Conditions apply.</p>
          </div>

          <div className={`${style.intro}__action ${style.section}`}>
            <button
              type="button"
              className="btn"
              onClick={() =>
                this.context.frame.openModal('appointment', {
                  type: 'rsvp',
                  skipIntro: true,
                  studioTitle: 'Warehouse Sale',
                  date: '2019-08-24',
                  days: 2,
                  studioBtnText: 'RSVP Now',
                  studioBtnStyle: 'btn-primary',
                  confirmBtnText: 'Submit',
                  confirmBtnStyle: 'btn-primary',
                  pixelName: 'WH201908',
                  eventLabel: 'WH201908',
                  showTerms: true,
                  studioFilter: (studios) => studios.filter((s) => s.slug === 'warehouse'),
                  eventId: { 'Castlery Warehouse': 1 },
                })
              }
            >
              RSVP Now
            </button>
            <p>We’ll send you a reminder email & SMS with directions!</p>
          </div>

          <div className={style.section}>
            <h3>Payment Options</h3>
            <ReactPicture
              src="https://res.cloudinary.com/castlery/image/upload/w_1400,f_auto,q_auto/v1542855618/marketing/SG/201811/payments.jpg"
              alt="payment options"
              loader={{ ratio: 0.1298 }}
            />
          </div>

          <div className={style.section}>
            <h5>
              <strong>Please Note:</strong>
            </h5>
            <p className={`${style.section}__note`}>
              Payment to be done via self-checkout on mobile web browser (excludes iOS app).
            </p>
            <p className={`${style.section}__note`}>Cash payment and self-collection are not available.</p>
            <p className={`${style.section}__note`}>No cancellation, refund, exchange or warranty.</p>
            <p className={`${style.section}__note`}>Additional storage of purchased items is not available.</p>
            <p className={`${style.section}__note`}>
              Delivery is free for all orders made during this Warehouse Sale*.
            </p>
            <p className={`${style.section}__note`}>We’re expecting crowds and kindly seek your patience!</p>
            <p className={`${style.section}__note hint`}>
              *Fees may apply for non-standard deliveries. Visit{' '}
              <Link to="/delivery" target="_blank">
                Delivery Page
              </Link>{' '}
              for more info.
            </p>
          </div>
        </div>
        {/* <Container fixed>
          <div className={style.gallery}>
            <h3>Our Past Events</h3>
            <p>
              Over 4000 shoppers. {mobile && <br />}Over 800 items snapped up.
              <br />
              Come and be part of the excitement this round!
            </p>
            <ResponsiveSlick
              className={`${style.gallery}__list`}
              mediaQueries={
                mobile
                  ? [
                    {
                      query: `(max-width: ${getBreakpoint('sm', 'max')}px)`,
                      numPerPage: 1,
                    },
                    {
                      query: `(min-width: ${getBreakpoint('md', 'min')}px) and (max-width: ${getBreakpoint('md', 'max')}px)`,
                      numPerPage: 2,
                    },
                    {
                      query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                      numPerPage: 3,
                    },
                  ]
                  : [
                    {
                      query: '(min-width: 0)',
                      numPerPage: 3,
                    },
                  ]
              }
            >
              {this.images.map((image, index) => (
                <div key={index}>
                  <ReactPicture
                    srcset={image}
                    
                    loader={{ ratio: mobile ? 0.78 : 0.818 }}
                    alt={`past events ${index}`}
                  />
                </div>
              ))}
            </ResponsiveSlick>
          </div>
        </Container> */}
      </div>
    );
  }
}
