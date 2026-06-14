import lang from 'utils/lang';
import { localBusinessJsonLd } from './config/data';

export const baseLocalBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  name: 'Castlery',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 1.3051935,
    longitude: 103.8305934,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '10:00',
    closes: '21:00',
  },
  // sameAs: [
  //   'https://www.facebook.com/CastlerySG/',
  //   'https://www.instagram.com/CastlerySG/',
  //   'https://www.castlery.com/sg',
  // ],
  sameAs: [
    lang.t('social.facebook'),
    lang.t('social.instagram'),
    lang.t('social.pinterest'),
    'https://www.castlery.com/sg',
  ],
};

export function getLocalBusinessJsonLd(data = {}) {
  return {
    ...baseLocalBusinessJsonLd,
    ...localBusinessJsonLd[__COUNTRY__],
    name: data.name || baseLocalBusinessJsonLd.name,
    image:
      (data.image_small && (data.image_small[2] || data.image_small[1] || data.image_small[0])) ||
      baseLocalBusinessJsonLd.image,
    '@id': __BASE_URL__,
    // url: __ONE_PIECE_WEB_SERVER_NAME__,
    telephone: data.contact_number || lang.t('common.telephone.value'),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.lat || baseLocalBusinessJsonLd.geo.latitude,
      longitude: data.lng || baseLocalBusinessJsonLd.geo.longitude,
    },
  };
}
