export const setNamespace =
  ({ namespace }) =>
  (req, res, next) => {
    // wrap the events from request and response
    namespace.bindEmitter(req);
    namespace.bindEmitter(res);

    // run following middleware in the scope of the namespace we created
    namespace.run(() => {
      namespace.set('user-agent', req.headers['user-agent']);
      namespace.set('req', req);
      namespace.set('res', res);
      next();
    });
  };
