/**
 * Temporary regional restrictions, restrictions will be removed in the next version
 */
export const showLoyalTyV2Requirements = true; // over 3 regions

export const temporaryRedirectUrls = showLoyalTyV2Requirements
  ? [
      {
        url: '/rewards',
        redirect: '/the-castlery-club',
      },
      {
        url: '/account/rewards',
        redirect: '/account/the-castlery-club',
      },
      {
        url: '/store-credits-terms',
        redirect: '/the-castlery-club-terms',
      },
    ]
  : [];
