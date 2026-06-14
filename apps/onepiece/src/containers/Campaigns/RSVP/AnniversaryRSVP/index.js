import React from 'react';
import PropTypes from 'prop-types';
import { withUseBreakpoints, wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import { renderImage } from 'utils/image';
import ResponsiveSlick from 'components/ResponsiveSlick';
import { getBreakpoint } from 'utils/breakpoints';
import { isOutdated } from 'utils/time';
import Promotions from 'components/Promotions';
import { Link } from 'react-router';
import { getUrl } from 'pages';

import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class AnniversaryRSVP extends React.PureComponent {
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
    const hasStarted = !isOutdated('2019-10-25 12:00', '2019-10-29 00:00');
    const studios = [
      {
        name: 'Jit Poh Studio',
        address: '19 Keppel Road, #02-06, Jit Poh Building',
        image: `static/2019-anniversary/sg_rsvp_anniversary_jitpoh_${desktop ? 'desktop' : 'mobile'}`,
        url: 'https://goo.gl/maps/tmo9StbK2aK2',
      },
      {
        name: 'The Grandstand Studio',
        address: '200 Turf Club Road, #03-07, The Grandstand',
        image: `static/2019-anniversary/sg_rsvp_anniversary_grandstand_${desktop ? 'desktop' : 'mobile'}`,
        url: 'https://goo.gl/maps/uKVJg2weFPm',
      },
    ];
    const freebies = [
      {
        title: 'In-store Freebies',
        desc: `<strong>Free Castlery glassware</strong> with <u>any in-store purchase</u> – no min. spend ${
          desktop ? '<br/>' : ''
        }required. Grab them while stocks last!`,
        image: 'static/2019-anniversary/sg_eventday_anniversary_freebies.jpg',
      },
      {
        title: 'Sweet Treats',
        desc: `Sip on <strong>complimentary bubble tea</strong> while you shop our ${
          desktop ? '<br />' : ''
        }wide range of stylish furniture.`,
        image: 'static/2019-anniversary/sg_eventday_anniversary_tea.jpg',
      },
    ];

    const getRSVPBtn = (className, text) => (
      <div className={className}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            this.context.frame.openModal('appointment', {
              type: 'rsvp',
              skipIntro: true,
              studioTitle: 'Anniversary RSVP',
              date: '2019-10-26',
              days: 3,
              studioBtnText: 'RSVP Now',
              studioBtnStyle: 'btn-primary',
              confirmBtnText: 'Submit',
              confirmBtnStyle: 'btn-primary',
              pixelName: 'Anniversary2019',
              eventLabel: 'Anniversary2019',
              showTerms: true,
              eventId: { 'Jit Poh Studio': 8, 'The Grandstand Studio': 9 },
            })
          }
        >
          {text}
        </button>
      </div>
    );

    return (
      <div>
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: hasStarted
                ? '/static/2019-anniversary/sg_eventday_anniversary_banner_mobile.jpg'
                : '/static/2019-anniversary/sg_rsvp_anniversary_banner_mobile.jpg',
              loader: { ratio: 1 },
            },
            {
              breakpoint: 'lg',
              srcset: hasStarted
                ? '/static/2019-anniversary/sg_eventday_anniversary_banner_desktop.jpg'
                : '/static/2019-anniversary/sg_rsvp_anniversary_banner_desktop.jpg',
              loader: { ratio: 0.4167 },
            },
          ]}
          lazy={false}
          title="Anniversary RSVP"
        />

        {hasStarted ? (
          <div className={`${style.intro}`}>
            <div className={`${style.intro}__container`}>
              <div className={`${style.intro}__desc`}>
                We are 6! Celebrate with us at our studios this long weekend for
                <strong> in-store freebies and upsized rebates</strong>,{desktop ? <br /> : ''}
                on top of on-going Anniversary promotions!
              </div>
            </div>
          </div>
        ) : (
          <div className={style.intro}>
            <div className={`${style.intro}__container`}>
              <div className={`${style.intro}__desc`}>
                <p>
                  Shop in studio this long weekend for <strong>surprise offers & giveaways</strong>, on top of on-going
                  anniversary promotions!
                </p>
                <p>
                  Plus, enjoy <strong>special sweet treats</strong> as you get up close with our wide range of stylish
                  furniture.
                </p>
              </div>
              <div className={`${style.intro}__action`}>
                <p className={`${style.intro}__action-hint`}>Curious?</p>
                {getRSVPBtn(style.rsvp, 'RSVP To Find Out')}
              </div>
            </div>
          </div>
        )}

        {hasStarted && (
          <div className={style.rebates}>
            <h2 className={`${style.rebates}__title`}>Supersized Rebates</h2>
            <div className={`${style.rebates}__desc`}>
              Enjoy up to <strong>$1,200 off</strong> your in-store or online purchase – <i>till 28 Oct only!</i>
            </div>
            <Promotions className={`${style.rebates}__promotions`} fromRSVP />
          </div>
        )}

        {hasStarted && (
          <Container className={`${style.freebies}`}>
            {freebies.map((freebie) => (
              <div key={freebie.title} className={`${style.freebies}__freebie`}>
                <h2 className={`${style.freebies}__freebie-title`}>{freebie.title}</h2>
                <div className={`${style.freebies}__freebie-desc`} dangerouslySetInnerHTML={{ __html: freebie.desc }} />
                {renderImage(freebie.image, 0.5882, desktop ? 0.5 : 1, { alt: 'Freebie' })}
              </div>
            ))}
          </Container>
        )}

        <div className={style.event}>
          <Container className={`${style.event}__container`}>
            <div className={`${style.event}__title`}>{hasStarted ? 'Join the party!' : 'Event Details'}</div>
            <div className={`${style.event}__date`}>
              <p>26 - 28 October 2019</p>
              <p>Sat - Mon, 10am - 6pm</p>
            </div>
            <div className={`${style.event}__studios`}>
              {studios.map((studio) => (
                <div key={studio.name} className={`${style.event}__studio`}>
                  {renderImage(studio.image, desktop ? 0.5882 : 1, 0.5, { alt: studio.name })}
                  <div className={`${style.event}__studio-name`}>{studio.name}</div>
                  <div className={`${style.event}__studio-address`}>{studio.address}</div>
                  <a className={`${style.event}__studio-link`} href={studio.url} target="_blank" rel="noopener">
                    How to get there {'>'}
                  </a>
                </div>
              ))}
            </div>
          </Container>
        </div>

        <div className={style.reminder}>
          {getRSVPBtn(style.rsvp, 'RSVP Now')}
          {hasStarted ? (
            <Link to={getUrl('promo-terms')} className={`${style.reminder}__terms`}>
              Promo T&Cs apply.
            </Link>
          ) : (
            <div className={`${style.reminder}__desc`}>We’ll also send you a reminder email & SMS with directions!</div>
          )}
        </div>

        {!hasStarted && (
          <div className={style.past}>
            <div className={`${style.past}__title`}>Our Past Events</div>
            <ResponsiveSlick
              mediaQueries={
                desktop
                  ? [
                      {
                        numPerPage: 3,
                      },
                    ]
                  : [
                      {
                        query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                        numPerPage: 1,
                      },
                      {
                        query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                        numPerPage: 3,
                      },
                    ]
              }
            >
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className={`${style.past}__event`}>
                  {renderImage(
                    `static/2019-anniversary/sg_rsvp_anniversary_events_${index}.jpg`,
                    0.8186,
                    desktop ? 0.33 : 1,
                    { alt: `past events ${index}` }
                  )}
                </div>
              ))}
            </ResponsiveSlick>
          </div>
        )}
      </div>
    );
  }
}
