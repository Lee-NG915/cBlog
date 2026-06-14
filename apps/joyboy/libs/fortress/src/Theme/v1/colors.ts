export const palette = {
  terracotta: {
    // --fortress-palette-primary-10
    10: '#F6EFEB',
    50: '#F6EFEB',
    100: '#EDDED7',
    200: '#DBBDAF',
    300: '#C89D87',
    400: '#C36A3E',
    500: '#A45B37', // brand
    mainChannel: '164 91 55', // brand
    600: '#8A4C2E',
    700: '#7D300B',
    800: '#4D2B19',
    900: '#2E190F',
  },
  wheat: {
    // --fortress-palette-brand-wheat-10
    10: '#F9F7F3',
    50: '#F9F7F3',
    100: '#F3EFE7',
    200: '#E6DFCF',
    300: '#DBCFB5',
    400: '#CDBF9E',
    500: '#C1AF86', // brand
    mainChannel: '193 175 134', // brand
    600: '#B39D6B',
    700: '#877445',
    800: '#6C5D37',
    900: '#514529',
  },
  sage: {
    // --fortress-palette-brand-sage-10
    10: '#EAECEA',
    50: '#EAECEA',
    100: '#D4D8D5',
    200: '#BFC5C0',
    300: '#A9B1AB',
    400: '#949E96',
    500: '#778379', // brand
    mainChannel: '119 131 121', // brand
    600: '#6B766C',
    700: '#576059',
    800: '#444B45',
    900: '#303631',
  },
  chai: {
    // --fortress-palette-brand-chai-10
    10: '#F8F6F1',
    50: '#F8F6F1',
    100: '#F2EDE3',
    200: '#EBE4D6',
    300: '#E4DBC8',
    400: '#DBCFB5', // brand
    mainChannel: '219 207 181', // brand
    500: '#D1C19F',
    600: '#C3AF83',
    700: '#B69D68',
    800: '#A58A50',
    900: '#8A7342',
  },
  flour: {
    // --fortress-palette-brand-flour-10
    10: '#FFFDF9', // brand
    50: '#FFFDF9', // brand
    mainChannel: '255 253 249', // brand
    100: '#FFF8EB',
    200: '#FFF1D6',
    300: '#FFE4AD',
    400: '#FFDD99',
    500: '#FFCF70',
    600: '#FFC247',
    700: '#F5A300',
    800: '#F5A300',
    900: '#CC8800',
  },
  charcoal: {
    // --fortress-palette-brand-charcoal-10
    0: '#FFFFFF',
    10: '#F9F9F9',
    50: '#F9F9F9',
    100: '#F1F1F1',
    200: '#E9E9E9',
    300: '#CDCDCD',
    400: '#929292',
    500: '#767676',
    600: '#606060',
    700: '#4A4A4A',
    800: '#323433', // brand
    mainChannel: '50 52 51', // brand
    900: '#222222',
  },
  greenMunsell: {
    50: '#E5F6F1',
    100: '#CCEDE4',
    200: '#00CC92',
    300: '#00A676', // brand
    mainChannel: `0 166 118`,
    400: '#008F66',
    500: '#007A58',
  },
  upsdellRed: {
    // --fortress-palette-brand-upsdellRed-10
    50: '#F7E5E9',
    100: '#EFCCD2',
    200: '#CC0025',
    300: '#B00020',
    mainChannel: '176 0 32',
    400: '#A3001E',
    500: '#8F001A',
  },
  harvestGold: {
    50: '#FDF4E7',
    100: '#FAEACF',
    200: '#F4AE3E',
    300: '#E7940D',
    mainChannel: '231 148 13',
    400: '#D4880C',
    500: '#C17B0B',
  },
  blueNCS: {
    50: '#E5F4FA',
    100: '#CCE9F5',
    200: '#00AFF5',
    300: '#0092CC',
    mainChannel: '0 146 204',
    400: '#0084B8',
    500: '#0075A3',
  },
} as Record<string, any>;

export const primaryColors = {
  ...palette.terracotta,
};
export const neutralColors = {
  ...palette.wheat,
};
export const successColors = {
  // --fortress-palette-success-300
  ...palette.greenMunsell,
};
export const dangerColors = {
  // --fortress-palette-danger-300
  ...palette.upsdellRed,
};
export const warningColors = {
  // --fortress-palette-warning-300
  ...palette.harvestGold,
};
export const infoColors = {
  // --fortress-palette-info-300
  ...palette.blueNCS,
  600: palette.blueNCS[500],
  700: palette.blueNCS[500],
  800: palette.blueNCS[500],
  900: palette.blueNCS[500],
  mainChannel: `var(--fortress-palette-info-300)`,
};
