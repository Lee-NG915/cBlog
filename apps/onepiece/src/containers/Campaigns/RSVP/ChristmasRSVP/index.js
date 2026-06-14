import React from 'react';
import PropTypes from 'prop-types';
import { withUseBreakpoints, wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import { renderImage } from 'utils/image';
import { Link } from 'react-router';
import { getUrl } from 'pages';

import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class ChristmasRSVP extends React.PureComponent {
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

    const studios = [
      {
        name: 'Jit Poh Studio',
        address: '19 Keppel Road, #02-06, Jit Poh Building',
        image: `static/rsvp/jitpoh_${desktop ? 'desktop' : 'mobile'}`,
        url: 'https://goo.gl/maps/tmo9StbK2aK2',
      },
      {
        name: 'The Grandstand Studio',
        address: '200 Turf Club Road, #03-07, The Grandstand',
        image: `static/rsvp/grandstand_${desktop ? 'desktop' : 'mobile'}`,
        url: 'https://goo.gl/maps/uKVJg2weFPm',
      },
    ];

    const campaigns = [
      {
        title: 'First Look, First Dibs',
        desc: `Get first look at some of our newest arrivals! Bring them home at <strong>additional 10% off</strong> your purchase - just for this weekend. `,
        image: '/static/rsvp/christmas/new_arrivals',
        actionText: 'Browse New Arrivals >',
        actionLink: getUrl('new'),
      },
      {
        title: 'Our Gift To You',
        desc: `It’s not Christmas without presents! We’re giving you a <strong>complimentary tableware set (worth up to $171)</strong> with any in-studio purchase of min. $1K spend – while stocks last!`,
        image: '/static/rsvp/christmas/free_gift',
        actionText: 'Browse Accessories >',
        actionLink:
          '/xmas-sale?category[0]=accessories&category[1]=tableware&category[2]=lighting&tags[0]=clearance&tags[1]=sale',
      },
      {
        title: 'Christmas Sale',
        desc: `Plus, enjoy our ongoing festive sale - with <strong>up to 30% off</strong> our wide range of crowd favourites across living, dining, bedroom and accessories.`,
        image: '/static/rsvp/christmas/christmas_sale',
        actionText: 'Browse Christmas Sale >',
        actionLink: getUrl('xmas-sale'),
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
              studioTitle: 'Christmas Special',
              date: '2019-11-23',
              days: 2,
              studioBtnText: 'Next',
              studioBtnStyle: 'btn-primary',
              confirmBtnText: 'Submit',
              confirmBtnStyle: 'btn-primary',
              pixelName: 'Christmas2019',
              eventLabel: 'Christmas2019',
              showTerms: true,
              eventId: { 'Jit Poh Studio': 10, 'The Grandstand Studio': 11 },
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
              srcset: '/static/rsvp/christmas/christmas_event_banner_mobile.jpg',
              loader: { ratio: 0.5333 },
            },
            {
              breakpoint: 'lg',
              srcset: '/static/rsvp/christmas/christmas_event_banner_desktop.jpg',
              loader: { ratio: 0.4167 },
            },
          ]}
          lazy={false}
          title="Christmas RSVP"
        />

        <div className={style.intro}>
          <div className={`${style.intro}__container`}>
            <h2 className={`${style.intro}__title`}>
              {!desktop ? (
                <>
                  <span>23 & 24 Nov</span>
                  Christmas Special
                </>
              ) : (
                'It’s the Most Wonderful Time of the Year!'
              )}
            </h2>

            <div className={`${style.intro}__desc`}>
              This weekend, pop by our studios to enjoy <strong>two-day only</strong> exclusive offers and free gifts as
              we unwind the year in style.
            </div>
            <div className={style.reminder}>
              {getRSVPBtn(style.rsvp, 'Remind Me')}
              <div className={`${style.reminder}__desc`}>
                We’ll also send you a reminder email & SMS with directions!
              </div>
            </div>
          </div>
        </div>

        <Container className={`${style.campaigns}`}>
          {campaigns.map((campaign, index) => (
            <div key={campaign.title} className={`${style.campaigns}__campaign`}>
              <Banner
                className={style.banner}
                mediaQueries={[
                  {
                    breakpoint: 'xs',
                    srcset: `${campaign.image}_mobile.jpg`,
                    loader: { ratio: 0.6355 },
                  },
                  {
                    breakpoint: 'lg',
                    srcset: `${campaign.image}_desktop.jpg`,
                    loader: { ratio: index === 0 ? 0.2778 : 0.5882 },
                  },
                ]}
                lazy
                title="Christmas RSVP"
              />
              <h3 className={`${style.campaigns}__campaign-title`}>{campaign.title}</h3>
              <div
                className={`${style.campaigns}__campaign-desc`}
                dangerouslySetInnerHTML={{ __html: campaign.desc }}
              />
              <Link className={`${style.campaigns}__campaign-link`} to={campaign.actionLink}>
                {campaign.actionText}
              </Link>
            </div>
          ))}
        </Container>

        <div className={style.event}>
          <Container className={`${style.event}__container`}>
            <div className={`${style.event}__title`}>Event Details</div>
            <div className={`${style.event}__date`}>
              <p>23 & 24 Nov 2019</p>
              <p>Sat & Sun, 10am - 6pm</p>
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
          {getRSVPBtn(style.rsvp, 'Remind Me')}
          <div className={`${style.reminder}__desc`}>We’ll also send you a reminder email & SMS with directions!</div>
        </div>
      </div>
    );
  }
}
