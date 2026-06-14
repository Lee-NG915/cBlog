import { optionTypesStrToObj, selectedObjToStr } from '../utils';

describe('utils', () => {
  test('selectedObjToStr', () => {
    const selected = {
      9: {
        id: 329,
        name: 'ivory_white',
        presentation: 'Ivory White',
        image_url:
          'https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_800/v1627549405/crusader/variants/TR-4003/Ivory-White_1.jpg',
        color: null,
        collection: {
          id: 2321,
          name: 'Swatch, Trinity Collection',
          description:
            "Soft and lightweight, Trinity's tonal depth comes from yarns woven together to create a richly-textured fabric.",
          presentation: 'Trinity Collection',
          knp_friendly: null,
          fabric_composition: '88% Polyester, 10% Nylon, 2% Cotton',
        },
      },
      12: {
        id: 283,
        name: 'left_facing',
        presentation: 'Left Facing',
        image_url: '',
        color: null,
      },
      15: {
        id: 353,
        name: 'brass_cap',
        presentation: 'Brass Cap',
        image_url: 'https://production-static-images.s3-ap-southeast-1.amazonaws.com/swatches/brass+cap.jpg',
        color: null,
      },
    };
    expect(selectedObjToStr(selected)).toBe('9:329;12:283;15:353');
  });
  test('selectedObjToStr : stirng must be in order by option_type_id ', () => {
    const selected = {
      12: {
        id: 283,
      },
      [`9`]: {
        id: 329,
      },
      15: {
        id: 353,
      },
    };
    expect(selectedObjToStr(selected)).toBe('9:329;12:283;15:353');
  });

  test('optionTypesStrToObj', () => {
    const str = '9:329;12:283;15:353';
    expect(optionTypesStrToObj(str)).toEqual([
      { option_type_id: 9, option_value_id: 329 },
      { option_type_id: 12, option_value_id: 283 },
      { option_type_id: 15, option_value_id: 353 },
    ]);
  });
});
