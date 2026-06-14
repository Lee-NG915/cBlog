// temporary route paths for CA
// const caTemporaryRoutePaths = ['/ca/privacy-policy/', '/ca/announcement/', '/ca/terms-of-use/'];

const countryRedirect = () => (req, res, next) => {
  const validBasePaths = ['/sg/', '/au/', '/us/', '/ca/', '/uk/', '/dist/'];
  const isValidPath = validBasePaths.find((validBasePath) => `${req.path}/`.includes(validBasePath));
  if (!isValidPath) {
    if (req.cookies.castlery_shop) {
      const basePath = `/${req.cookies.castlery_shop}/`;
      const finalUrl = req.url.replace('/', basePath);
      res.redirect(302, finalUrl);
    } else {
      res.redirect(302, '/');
    }
  } else if (req.url.slice(-1) === '/' && req.url.length > 1) {
    // remove tailing slash
    res.redirect(301, req.url.slice(0, -1));
  }
  // else if (__COUNTRY__ === 'CA') {
  //   if (caTemporaryRoutePaths.find((validBasePath) => `${req.path}/`.includes(validBasePath)) || req.path === '/ca') {
  //     return next();
  //   }
  //   res.redirect(302, '/ca');
  // }
  else {
    next();
  }
};

export default countryRedirect;
