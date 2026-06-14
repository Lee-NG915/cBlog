import React from 'react';
import Banner from 'components/Banner';
import PropTypes from 'prop-types';
import { GhostArrowBtn } from 'components/Button';
import { events, timetable } from '../config';
import style from './style.scss';

const Workshop = (props, { frame }) => {
  const openUrl = () => {
    frame.openModal('container', {
      className: `${style.workshop}__modal`,
      hideCloseBtn: true,
      component: (
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src="https://book.chope.co/booking?rid=castlery2304sg&source=castlery"
          title="Sign Up for Workshop"
        />
      ),
    });
  };

  return (
    <div className={`${style.workshop}`}>
      <div className={`${style.workshop}__wrapper`}>
        <Banner
          className={`${style.workshop}__head`}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset:
                '/v1683174011/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Morning_of_Mindfulness_Mobile.png',
            },
            {
              breakpoint: 'md',
              srcset:
                '/v1682218421/Brand%20and%20Content/Brand%20Campaigns/SG%20Brand%20Campaign%202_Mindfulness/Microsite%20Ver%201A%20and%201B/Fonts/Morning_of_Mindfulness_Desktop.png',
            },
          ]}
          title="Morning of Mindfulness"
        />
        <div className={`${style.workshop}__title`}>at Castlery Orchard Flagship</div>
        <div className={`${style.workshop}__description`}>
          Happening on May 27-28. Get set to experience the different ways you can practice mindfulness at home.
        </div>
      </div>

      <div className={`${style.workshop}__events`}>
        {events?.map((event, index) => (
          <div className={`${style.workshop}__event`} key={index}>
            <Banner
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: event.image_small,
                  loader: { ratio: 0.7846 },
                },
                {
                  breakpoint: 'lg',
                  srcset: event.image_large,
                  loader: { ratio: 0.6162 },
                },
              ]}
              title="Workshop"
            />

            <div className={`${style.workshop}__event__title`}>{event.name}</div>
            <div className={`${style.workshop}__event__desc`}>{event.description}</div>
            {event.joint_name && (
              <div
                className={`${style.workshop}__event__joint`}
                dangerouslySetInnerHTML={{ __html: event.joint_name }}
              />
            )}
          </div>
        ))}
      </div>

      {timetable && (
        <table className={`${style.workshop}__timetable`}>
          <thead>
            <tr>
              {timetable.header?.map((header, index) => (
                <th key={index} colSpan={header?.colSpan}>
                  {header.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.body?.map((row, index) => (
              <tr key={index}>
                {row.map((cell, idx) => (
                  <td key={idx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={`${style.workshop}__tip`}>
        *All slots are currently filled. Join our waitlist to get first dibs on new slot openings.
      </div>

      {/* Sign Up Now / Join Waitlist */}
      <GhostArrowBtn className={`${style.workshop}__btn`} text="Join Waitlist" hasArrow onClick={openUrl} />
    </div>
  );
};

Workshop.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default Workshop;
