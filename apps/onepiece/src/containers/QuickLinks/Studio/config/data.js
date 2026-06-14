import lang from 'utils/lang';

/**
 * @description baseLocalBusinessJsonLd
 */
export const localBusinessJsonLd = {
  SG: {
    '@id': 'https://www.castlery.com/sg/',
    url: 'https://www.castlery.com/sg/showroom',
    image:
      'https://res.cloudinary.com/castlery/image/upload/v1662622223/marketing/SG/Studio/studio_orchard_flagship_mobile_3.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '541 Orchard Road, #02/03-02 Liat Towers',
      addressLocality: 'Singapore',
      postalCode: '238881',
      addressCountry: 'SG',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '21:00',
    },
  },
  AU: {
    '@id': 'https://www.castlery.com/au/',
    url: 'https://castlery.com/au/showroom',
    image:
      'https://res.cloudinary.com/castlery/image/upload/v1711960554/AU%20Visit%20Showroom/AU_VisitStudio_Desktop.jpg',

    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Supa Centa Moore Park, Shop GF14, 2A Todman Ave',
      addressLocality: 'Kensington',
      addressRegion: 'NSW',
      postalCode: '2033',
      addressCountry: 'AU',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
        opens: '09:00',
        closes: '17:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Thursday',
        opens: '09:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '17:00',
      },
    ],
  },
  US: {},
};
