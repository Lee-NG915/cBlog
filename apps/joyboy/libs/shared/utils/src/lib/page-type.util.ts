export const PageTypes = [
  {
    routeKey: '/pla',
    pageType: 'PLA',
  },
];

export const getPageType = (pathname?: string) => {
  const _pathname = pathname ? pathname : typeof window === 'undefined' ? '' : window?.location?.pathname;
  if (!_pathname) {
    return '';
  }
  const target = PageTypes.find((page) => _pathname.includes(page.routeKey));
  if (target) {
    return target.pageType;
  }
  return '';
};

export const getPageSlug = (pathname?: string) => {
  const _pathname = pathname ? pathname : typeof window === 'undefined' ? '' : window?.location?.pathname;
  if (!_pathname) {
    return '';
  }
  const target = PageTypes.find((page) => _pathname.includes(page.routeKey));
  if (target) {
    return _pathname.split('/').pop();
  }
  return '';
};
