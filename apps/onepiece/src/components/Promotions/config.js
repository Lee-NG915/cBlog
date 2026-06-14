import { getConfig } from 'utils/config';
import off750 from './images/$750-Off.png';
import off1200 from './images/$1,200-Off.png';

const PROMOTIONS_CONFIGS = {
  SG: {
    data: [
      {
        title: '$35 OFF',
        body: '$750 spend',
      },
      {
        title: '$100 OFF',
        body: '$1,500 spend',
      },
      {
        title: '$200 OFF',
        body: '$2,500 spend',
      },
      {
        title: '$350 OFF',
        body: '$3,500 spend',
      },
      {
        title: '$600 OFF',
        body: '$5,000 spend',
        furtherPromotion: {
          title: '$600 OFF',
          body: '$5,000 spend',
          startDate: '2019-10-26 00:00',
          endDate: '2019-10-29 00:00',
          img: off750,
          alt: '$750 OFF',
        },
      },
      {
        title: '$1,000 OFF',
        body: '$7,000 spend',
        furtherPromotion: {
          title: '$1,000 OFF',
          body: '$7,000 spend',
          startDate: '2019-10-26 00:00',
          endDate: '2019-10-29 00:00',
          img: off1200,
          alt: '%1,200 OFF',
        },
      },
    ],
    startDate: '2019-10-14 00:00',
    endDate: '2019-11-08 00:00',
  },
  common: {
    data: [
      {
        title: '$100 OFF',
        body: '$1,000 spend',
      },
      {
        title: '$250 OFF',
        body: '$2,000 spend',
      },
      {
        title: '$500 OFF',
        body: '$3,500 spend',
      },
      {
        title: '$900 OFF',
        body: '$5,000 spend',
      },
    ],
    startDate: '2019-10-12 00:00',
    endDate: '2019-11-12 00:00',
  },
};

export const PROMOTIONS = getConfig(PROMOTIONS_CONFIGS);
