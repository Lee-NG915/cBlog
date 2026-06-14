import ctripApollo from 'ctrip-apollo';

let isSiteAvailable = true;

const initCtripApollo = async () => {
  const ctripApolloClient = ctripApollo({
    host: 'http://apollo-config-service-prod.castlery.internal',
    appId: 'onepiece',
  });

  // default namespace application
  const apolloNamespace = ctripApolloClient.namespace();
  const env = __APPLICATION_ENV__;
  apolloNamespace.on('change', ({ key, newValue }) => {
    if (key === env) {
      isSiteAvailable = newValue === 'true';
    }
  });

  await apolloNamespace.ready();
  isSiteAvailable = apolloNamespace.get(env) === 'true';
};

export const maintenance = () => (req, res, next) => {
  if (!isSiteAvailable && req.cookies.castlery_insider !== 'true') {
    res.render('maintenance', { country: __COUNTRY__.toLowerCase() });
  } else {
    if (!__DEVELOPMENT__) {
      initCtripApollo();
    }
    next();
  }
};
