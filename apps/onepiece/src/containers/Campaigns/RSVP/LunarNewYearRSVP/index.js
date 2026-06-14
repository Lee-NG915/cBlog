import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import { renderImage } from 'utils/image';
import { Link } from 'react-router';
import { getUrl, getPageByKey } from 'pages';
import { useSelector, useDispatch } from 'react-redux';
import { loadIfNeeded as loadStores } from 'redux/modules/stores';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { GhostArrowBtn } from 'components/Button';
import classNames from 'classnames';
import { isProd } from 'config';
import { EVENT_FORM_SUBMIT } from 'utils/track/constants';
import { trackSubscription } from 'utils/tracking';
import { randomId } from 'utils/number';

import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const LunarNewYearRSVP = () => {
  const stores = useSelector((state) => state.stores);
  const { desktop } = useBreakpoints();
  const { effective, isPromoteTime, isActualTime } = getPageByKey('lunar-new-year-event') || {};
  const dispatch = useDispatch();

  const trackKlaviyoForm = (e) => {
    const { type, metaData } = e?.detail || {};

    // This event fires when each step is submitted, and can fire multiple times per form
    if (type === 'stepSubmit') {
      const { $email: email } = metaData || {};
      const eventId = randomId('NewsletterSubscription');

      /* record signup newsletter event */
      trackSubscription(email, { eventId });

      dispatch({
        type: EVENT_FORM_SUBMIT,
        result: {
          action: 'Newsletter Sign-up',
          label: email,
          method: 'LNY event',
          eventId,
        },
      });
    }
  };

  useEffect(() => {
    // docs: https://developers.klaviyo.com/en/v1-2/docs/track-klaviyo-form-activity-using-javascript
    window.addEventListener('klaviyoForms', trackKlaviyoForm);

    return () => {
      window.removeEventListener('klaviyoForms', trackKlaviyoForm);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studios = stores?.data
    ?.filter((s) => s.is_public)
    ?.map((store) => ({
      name: store.name,
      address: store.address,
      image: store?.[`image_${!desktop ? 'small' : 'large'}`]?.[0],
      url: store.url,
    }));

  const campaigns = [
    {
      title: 'Abundance Spin',
      desc: isPromoteTime
        ? 'Pull the lever and let fortune favour you! Stand a chance to win our grand prize - a dining set of your choice. Plus, various prizes are up for grabs, including Castlery vouchers, accessories, and more in our sure-win game. Customers who register for the event get 3 chances at the Abundance Spin, while walk-in customers get 1 chance. The best part? The game is open to everyone who subscribes to our newsletter. Come join the fun and see where your fortune lands!'
        : 'Pull the lever and let fortune favour you! Stand a chance to win our grand prize - a dining set of your choice. Plus, various prizes are up for grabs, including Castlery vouchers, accessories, and more in our sure-win game. The best part? The game is open to everyone who subscribes to our newsletter. Come join the fun and see where your fortune lands!',
      imageDesktop: {
        src: '/SG%20LNY%20RSVP/Desktop/Abundance_Spin_Desktop.gif',
        ratio: 0.27813,
      },
      imageMobile: {
        src: '/SG%20LNY%20RSVP/Mobile/Abundance_Spin_Mobile.gif',
        ratio: 0.63454,
      },
    },
    isPromoteTime && {
      title: 'Exclusive Castlery Red Packet',
      desc: 'Receive your complimentary set of Red Packets on Jan 14 & 15 at our Orchard Flagship, while stocks last! Redeemable for customers who register for the event; limited to 1 set per customer.',
      imageDesktop: {
        src: '/SG%20LNY%20RSVP/Desktop/Red_Packets_Desktop.jpg',
        ratio: 0.27778,
      },
      imageMobile: {
        src: '/SG%20LNY%20RSVP/Mobile/Red_Packets_Mobile.jpg',
        ratio: 0.63554,
      },
    },
    {
      title: 'Calligraphy Couplet',
      desc: 'From 2.30pm to 5.30pm, welcome prosperity for the year ahead with our calligraphy master, who will draft festive couplets live on the spot. These couplets are available for redemption with purchases made at our event during Jan 14 & 15. No min. spend required; while stocks last.',
      imageDesktop: {
        src: '/SG%20LNY%20RSVP/Desktop/Couplets_Desktop.jpg',
        ratio: 0.27778,
      },
      imageMobile: {
        src: '/SG%20LNY%20RSVP/Mobile/Couplets_Mobile.jpg',
        ratio: 0.63554,
      },
    },
  ];

  const getRSVPBtn = () =>
    isPromoteTime ? (
      <div className={classNames(isProd ? 'klaviyo-form-RwbbVr' : 'klaviyo-form-Uu7dYY', `${style.reminder}__form`)} />
    ) : (
      <Link className={`${style.reminder}__link`} href={`${__BASE_URL__}${getUrl('studio')}`}>
        <GhostArrowBtn text="Visit our Showroom Now" />
      </Link>
    );

  if (!effective) {
    return null;
  }
  return (
    <div>
      <Banner
        className={style.banner}
        mediaQueries={[
          {
            breakpoint: 'xs',
            srcset: '/SG%20LNY%20RSVP/Mobile/KV_Mobile_Darkened.jpg',
            loader: { ratio: 0.5333 },
          },
          {
            breakpoint: 'lg',
            srcset: '/SG%20LNY%20RSVP/Desktop/KV_Desktop_Darkened.jpg',
            loader: { ratio: 0.29375 },
          },
        ]}
        lazy={false}
        title="Lunar New Year Event"
      >
        <div className={`${style.intro}__header`}>
          <h1 className={`${style.intro}__title`}>Lunar New Year Event</h1>
        </div>
      </Banner>

      <Container className={`${style.intro}`}>
        <div className={`${style.intro}__container`}>
          {isPromoteTime ? (
            <div className={`${style.intro}__desc`}>
              Ring in the festivities at our Lunar New Year Event on Jan 14 & 15! Register now to enjoy 3 chances at
              winning the grand prize at our Abundance Spin and an exclusive set of Castlery red packets.* Watch our
              calligraphy master draft your complimentary calligraphy couplet (with any purchase).
            </div>
          ) : (
            <div className={`${style.intro}__desc`}>
              Ring in the festivities at our Lunar New Year Event on Jan 14 & 15. Stand a chance to win the grand prize
              in our Abundance Spin - a dining set of your choice! Watch our calligraphy master draft your complimentary
              calligraphy couplet (with any purchase).
            </div>
          )}

          <div className={style.reminder}>
            {getRSVPBtn()}
            {isPromoteTime && <div className={`${style.reminder}__desc`}>*While stocks last.</div>}
          </div>
        </div>
      </Container>

      <Container className={`${style.campaigns}`}>
        <h2 className={`${style.campaigns}__title`}>Festivities & Activities</h2>
        {campaigns.map(
          (campaign) =>
            campaign && (
              <div key={campaign.title} className={`${style.campaigns}__campaign`}>
                <h3 className={`${style.campaigns}__campaign-title`}>{campaign.title}</h3>

                <Banner
                  className={style.banner}
                  mediaQueries={[
                    {
                      breakpoint: 'xs',
                      srcset: campaign.imageMobile.src,
                      loader: { ratio: campaign.imageMobile.ratio },
                    },
                    {
                      breakpoint: 'lg',
                      srcset: campaign.imageDesktop.src,
                      loader: { ratio: campaign.imageDesktop.ratio },
                    },
                  ]}
                  lazy
                  title={campaign.title}
                />
                <p
                  className={`${style.campaigns}__campaign-desc`}
                  dangerouslySetInnerHTML={{ __html: campaign.desc }}
                />
                {campaign.actionLink && campaign.actionText && (
                  <Link className={`${style.campaigns}__campaign-link`} href={`${__BASE_URL__}${campaign.actionLink}`}>
                    {campaign.actionText}
                  </Link>
                )}
              </div>
            )
        )}

        <div className={style.reminder}>{getRSVPBtn()}</div>

        {isActualTime && (
          <p className={`${style.campaigns}__campaign-desc`}>
            For customers who pre-registered for the event, please proceed to the redemption booth near the entrance on
            the event day to redeem your perks. It includes a game ticket for 3 chances at the Abundance Scroll and a
            complimentary pack of red packets* while stocks last.
          </p>
        )}
      </Container>

      <div className={style.event}>
        <Container className={`${style.event}__container`}>
          <div className={`${style.event}__title`}>Event Details</div>
          <div className={`${style.event}__date`}>
            <p>14 & 15 Jan 2023</p>
          </div>

          <Link href={`${__BASE_URL__}${getUrl('studio')}`} className={`${style.event}__studios`}>
            {studios?.map((studio) => (
              <div key={studio.name} className={`${style.event}__studio`}>
                {renderImage(studio.image, desktop ? 0.313 : 1.066, 1, { alt: studio.name })}
                <div className={`${style.event}__studio-name`}>{studio.name}</div>
                <div
                  className={`${style.event}__studio-address`}
                  dangerouslySetInnerHTML={{ __html: studio.address }}
                />
                <a
                  className={`${style.event}__studio-link`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  href={studio.url}
                  target="_blank"
                  rel="noopener"
                >
                  {'How to get there >'}
                </a>
              </div>
            ))}
          </Link>
        </Container>
      </div>
    </div>
  );
};

LunarNewYearRSVP.contextTypes = {
  frame: PropTypes.object.isRequired,
};

export default asyncLoad([({ store: { dispatch } }) => dispatch(loadStores())])(wrapPage()(LunarNewYearRSVP));
