import { getAllPageMap } from 'pages';
import { getSitemap as getAllPageLinks } from 'utils/seo';
import superagent from 'superagent';
import logger from '../utils/logger';

export const getSitemap = () => (req, res) => {
  const { type } = req.query;

  getAllPageLinks(type)
    .then((allPageLinks) => {
      res.json(allPageLinks);
    })
    .catch((error) => {
      logger.log('error', 'getSitemap', error);
      res.status(404).send('Not found');
    });
};

export const getCategorySeo = () => (req, res) => {
  const { key } = req.query;
  try {
    const page = getAllPageMap()[key];
    res.json({
      ...page,
      children: undefined, // omit children
    });
  } catch (err) {
    res.json({
      errMsg: 'Not found the page!',
    });
  }
};

export const getARModel = (req, res) => {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { uid, platform } = req?.query;
  try {
    if (uid && platform) {
      superagent.get(`https://sketchfab.com/i/archives/ar?model=${uid}&platform=${platform}`).end((err, data) => {
        if (err) {
          return res.json({
            errMsg: `Request Error! (${err})`,
          });
        }
        return res.json({
          url: JSON.parse(data.text || {}).url,
        });
      });
    } else {
      return res.json({
        errMsg: 'Lack of parameter!',
      });
    }
  } catch (err) {
    return res.json({
      errMsg: 'Not found!',
    });
  }
};
