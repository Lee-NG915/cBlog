export const LAYOUT_MODE = {
  CART: 'CART',
  MINI_CART: 'MINI_CART',
  SHIPMENT: 'SHIPMENT',
  SUMMARY: 'SUMMARY',
} as const;

export const ITEM_PICTURE_LAYOUT_CONFIG = {
  [LAYOUT_MODE.CART]: {
    IMAGE_SIZE: {
      DESKTOP: { width: 240, height: 133 },
      TABLET: { width: 240, height: 133 },
      MOBILE: { width: 165, height: 100 },
    },
    BUNDLE_IMAGE_SIZE: {
      DESKTOP: { width: 220, height: 110 },
      TABLET: { width: 220, height: 110 },
      MOBILE: { width: 136, height: 68 },
    },
    MARGIN_LEFT: {
      DESKTOP: 5,
      TABLET: 5,
      MOBILE: 7.25,
    },
  },
  [LAYOUT_MODE.MINI_CART]: {
    IMAGE_SIZE: {
      DESKTOP: { width: 216, height: 120 },
      TABLET: { width: 216, height: 120 },
      MOBILE: { width: 165, height: 100 },
    },
    BUNDLE_IMAGE_SIZE: {
      DESKTOP: { width: 180, height: 90 },
      TABLET: { width: 180, height: 90 },
      MOBILE: { width: 136, height: 68 },
    },
    MARGIN_LEFT: {
      DESKTOP: 9,
      TABLET: 9,
      MOBILE: 7.25,
    },
  },
  [LAYOUT_MODE.SHIPMENT]: {
    IMAGE_SIZE: {
      DESKTOP: { width: 216, height: 120 },
      TABLET: { width: 216, height: 120 },
      MOBILE: { width: 165, height: 100 }, // special
    },
    BUNDLE_IMAGE_SIZE: {
      DESKTOP: { width: 180, height: 90 },
      TABLET: { width: 180, height: 90 },
      MOBILE: { width: 136, height: 68 },
    },
    MARGIN_LEFT: {
      DESKTOP: 9,
      TABLET: 9,
      MOBILE: 9,
    },
  },
  [LAYOUT_MODE.SUMMARY]: {
    IMAGE_SIZE: {
      DESKTOP: { width: 171, height: 95 },
      TABLET: { width: 142, height: 95 },
      MOBILE: { width: 165, height: 100 },
    },
    BUNDLE_IMAGE_SIZE: {
      DESKTOP: { width: 135, height: 68 },
      TABLET: { width: 100, height: 67 },
      MOBILE: { width: 136, height: 68 },
    },
    MARGIN_LEFT: {
      DESKTOP: 9,
      TABLET: 10.5,
      MOBILE: 7.25,
    },
  },
};
