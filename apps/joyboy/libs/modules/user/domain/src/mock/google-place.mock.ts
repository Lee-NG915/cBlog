export const googlePlacesMock = {
  predictions: [
    {
      description: 'Los Angeles, CA 90023, USA',
      google_place_id: 'ChIJIx09IErPwoARjgZb8t9y6gc',
    },
    {
      description: '90023 Manion Drive, Warrenton, OR, USA',
      google_place_id: 'ChIJK7EH6FJgk1QR-QNBYB6jqFU',
    },
    {
      description: '90023rd, Perrysburg, OH, USA',
      google_place_id:
        'Ehw5MDAyM3JkLCBQZXJyeXNidXJnLCBPSCwgVVNBIi4qLAoUChIJEZAL-R-IO4gRLoltvn0cjYgSFAoSCVXp8kDhdDyIEVH_IgLlLALV',
    },
    {
      description: '90023 Arbor Avenue, Fort Collins, CO, USA',
      google_place_id: 'ChIJ04RSWpBLaYcR0sw76YDSdmc',
    },
    {
      description: '90023 Pm, Albuquerque, NM, USA',
      google_place_id: 'ChIJCRKTL3cRIocRgcH1Y5pnF40',
    },
  ],
};

export const parsedGooglePlaceMock = {
  address1: 'Arbor Avenue',
  city: 'Los Angeles',
  zipcode: '90023',
  state_name: 'CA',
  street: 'Arbor Avenue',
  street_number: '',
};
