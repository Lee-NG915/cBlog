import { getDate } from 'utils/time';

export const setDYCookie = () => (req, res, next) => {
  if (req.cookies._dyid) {
    // if this is a returning user and the DYID cookie exists
    const dyid = req.cookies._dyid;
    res.cookie('_dyid_server', dyid, {
      // store a new server-side cookie named "_dyid_server" with the DYID value
      expires: new Date(Date.now() + 31536000000), // Set a 1 year expiration for the new cookie
      secure: true,
    });
  }

  const { ranMID, ranSiteID } = req.query;
  if (ranMID && ranSiteID) {
    const rmStoreGateway = `amid:${ranMID}|ald:${getDate().utc().format('YYYYMMDD_HHmm')}|auld:${getDate()
      .utc()
      .unix()}|atrv:${ranSiteID}`;

    res.cookie('rmStoreGateway', rmStoreGateway, {
      expires: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      path: '/',
      secure: true,
      sameSite: 'Lax',
    });
  }

  next();
};
