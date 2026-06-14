export const CookieNames = {
  pdpViewedCountPerSession: 'productPageCount',
};

export const LocalStorageNames = {
  fbUser: 'fb_user',
  fbLoginId: 'fb_login_id',
  fbLoginEmail: 'fb_login_email',
};

export const commonPrefix = __APPLICATION_ENV__.toLowerCase();
export const SessionStorageNames = {
  fbClId: `${commonPrefix}_fbclid`,
  fbcFromClId: `${commonPrefix}_fbc_from_clid`,
  identifyReported: `${commonPrefix}_clsr_identify_reported`,
};
