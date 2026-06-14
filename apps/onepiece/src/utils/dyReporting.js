import ApiClient from 'helpers/ApiClient';
import { get as getCookie } from 'helpers/Cookie';

const client = new ApiClient();

// Custom API Campaign
const reportClickEngagement = ({ decisionId, variationId }) => {
  client
    .post('https://direct-collect.dy-api.com/v2/collect/user/engagement', {
      header: {
        'Content-Type': 'application/json',
        'dy-api-key': __CLIENT_DY_API_KEY__,
      },
      data: {
        user: {
          dyid: getCookie('_dyid') || window.DY.dyid,
          dyid_server: getCookie('_dyid_server'),
        },
        session: {
          dy: getCookie('_dyjsession') || window.DY.session,
        },
        engagements: [
          {
            type: 'CLICK',
            decisionId, // the unique Decision ID as returned from the choose endpoint.
            variations: variationId && [variationId], // Only required for reporting explicit impressions over Custom Campaigns which return multiple variations on each decision (e.g. a slider)**: an array of multiple variation IDs the user seen.
          },
        ],
      },
    })
    .catch((error) => {
      console.log('🚀 ~ file: dyReporting.js:32 ~ reportClickEngagement ~ error:', error);
    });
};

// https://dy.dev/reference/reporting-engagement
// API Recommendations Campaign
const reportRecommendationsEngagement = ({ slotId }) => {
  client
    .post('https://direct-collect.dy-api.com/v2/collect/user/engagement', {
      header: {
        'Content-Type': 'application/json',
        'dy-api-key': __CLIENT_DY_API_KEY__,
      },
      data: {
        user: {
          dyid: getCookie('_dyid') || window.DY.dyid,
          dyid_server: getCookie('_dyid_server'),
        },
        session: {
          dy: getCookie('_dyjsession') || window.DY.session,
        },
        engagements: [
          {
            type: 'SLOT_CLICK',
            slotId, // the Slot ID for the specific clicked product as returned from the choose endpoint.
          },
        ],
      },
    })
    .catch((error) => {
      console.log('🚀 ~ file: dyReporting.js:58 ~ reportRecommendationsEngagement ~ error:', error);
    });
};

const reportEvent = ({ eventName }) => {
  client
    .post('https://direct-collect.dy-api.com/v2/collect/user/event', {
      header: {
        'Content-Type': 'application/json',
        'dy-api-key': __CLIENT_DY_API_KEY__,
      },
      data: {
        user: {
          dyid: getCookie('_dyid') || window.DY.dyid,
          dyid_server: getCookie('_dyid_server'),
        },
        session: {
          dy: getCookie('_dyjsession') || window.DY.session,
        },
        events: [
          {
            name: eventName,
          },
        ],
      },
    })
    .catch((error) => {
      console.log('🚀 ~ file: dyReporting.js:81 ~ reportEvent ~ error:', error);
    });
};

export { reportClickEngagement, reportRecommendationsEngagement, reportEvent };
