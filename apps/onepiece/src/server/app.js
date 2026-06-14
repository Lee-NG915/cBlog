import path from 'path';
import http from 'http';
import Express from 'express';
import compression from 'compression';
import favicon from 'serve-favicon';
import PrettyError from 'pretty-error';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import responseTime from 'response-time';
import { createNamespace } from 'cls-hooked';
import { isProd, isUat } from 'config';
import { initNodeSentry } from 'utils/sentry.server.config';
import logger from './utils/logger';
import ApiClient from '../helpers/ApiClient';
import countryRedirect from './middlewares/countryRedirect';
import { setDYCookie } from './middlewares/setDYCookie';
// import { maintenance } from './middlewares/maintenance';
import { setNamespace } from './middlewares/setNamespace';
import { renderSitemap } from './controllers/sitemapController';
import { getCategorySeo, getSitemap, getARModel } from './controllers/apiController';
import { renderJobBoard, renderJobDetail, renderGraduateProgrammePage } from './controllers/careersController';
import { renderMain } from './controllers/mainController';
import { renderRoot } from './controllers/rootController';
import requestBeforeStartup from './utils/requestBeforeStartup';
import { pollMaintainDNSRecord } from './utils/pollMaintenceStatus';
// import 'containers/Storyblok/setup';
import monitorServerMetrics from './utils/monitorServerMetrics';
import userAgentMiddleware from './middlewares/userAgent';
import { requestTimeThresholdMonitor } from './utils/requestTimeThresholdMonitor';
// create namespace only once  just like ThreadLocal
const namespace = createNamespace('castlery');
const pretty = new PrettyError();
const app = new Express();
const server = new http.Server(app); // this is to register upgrade event for websocket proxy

initNodeSentry(Sentry, { app }); // config sentry

if (__SENTRY_DSN__ && __APP_ENV__) {
  Sentry.setupConnectErrorHandler(app);
}

app.use(
  responseTime((req, res, time) => {
    requestTimeThresholdMonitor(req, time);
  })
);

app.enable('trust proxy'); // enable trust proxy to bypass nginx
app.use(compression()); // gzip enabled

const staticPath = path.join(process.cwd(), 'static');
app.use(favicon(path.join(staticPath, 'favicon', 'favicon.ico'))); // optimize favicon
app.use('/robots.txt', Express.static(path.join(staticPath, 'robots.txt')));
app.use(
  '/28ad7d6575564a05bb4f4d05366a360c.txt',
  Express.static(path.join(staticPath, '28ad7d6575564a05bb4f4d05366a360c.txt'))
);
app.use(
  '/static',
  Express.static(staticPath, {
    maxAge: 365 * 24 * 3600000, // never expire for static files
  })
); // serve static files in '/static' folder
app.use(cookieParser());
app.set('view engine', 'pug');
app.set('views', './static');

// log
app.use(
  morgan(
    (tokens, req, res) =>
      JSON.stringify({
        remote_addr: tokens['remote-addr'](req, res),
        remote_user: tokens['remote-user'](req, res),
        date: tokens.date(req, res, 'clf'),
        url: tokens.url(req, res),
        'http.method': tokens.method(req, res),
        'http.version': tokens['http-version'](req, res),
        'http.status_code': tokens.status(req, res),
        'http.referrer': tokens.referrer(req, res),
        'http.user_agent': tokens['user-agent'](req, res),
        response_length: tokens.res(req, res, 'content-length'),
        response_time: `${tokens['response-time'](req, res)}ms`,
        total_time: `${tokens['total-time'](req, res)}ms`,
        request_header: tokens.req(req, res, 'header'),
      }),
    {
      stream: {
        write: (message) => {
          const messageObj = JSON.parse(message);
          logger.info(`${messageObj['http.method']} ${messageObj.url} ${messageObj['http.status_code']}`, messageObj);
        },
      },
      skip: (req, res) => req.originalUrl === '/health',
    }
  )
);

// maintenance mode with ctrip apollo
// app.use(maintenance());

app.get('*', userAgentMiddleware());

// add a middle ware to declare variable in per request scope
app.use(setNamespace({ namespace }));

app.all('/', renderRoot({ namespace }));

// health check
app.get('/health', (req, res) => {
  res.send('Status: Up');
});
app.all('/careers', renderJobBoard({ namespace, pretty }));
app.all('/careers-list', renderJobDetail({ namespace, pretty }));
// app.all('/careers/graduate-programme', renderGraduateProgrammePage({ namespace, pretty }));

// domain consolidation routing
app.use(countryRedirect());

// Safari ITP fix, https://support.dynamicyield.com/hc/en-us/articles/360007211797-Safari-s-Internet-Tracking-Prevention-ITP-Policy-?flash_digest=8a711f2e0eb00b37bdfcbf468d1acf0d9f4f6f3d#code-examples-0-4
app.use(setDYCookie());

// api route
app.get(`${__BASE_ROUTE__}/api/sitemap`, getSitemap());
app.get(`${__BASE_ROUTE__}/api/category-seo`, getCategorySeo());
app.get(`${__BASE_ROUTE__}/api/ar-model`, getARModel);

app.all(`${__BASE_ROUTE__}/sitemap.xml`, renderSitemap());

app.use(renderMain({ namespace, pretty }));

/**
 *
 * Error handling
 *
 */
if (__SENTRY_DSN__ && __APP_ENV__) {
  Sentry.setupConnectErrorHandler(app);
}

/**
 * only poll maintain dns record in production
 * uat for testing
 */
if (isProd && !isUat) {
  pollMaintainDNSRecord();
}

if (__CHECK_SYSTEM_METRICS__) {
  monitorServerMetrics();
}

if (__PORT__) {
  let retryTimesLeft = 7;
  const client = new ApiClient();
  let timer = null;
  // load routers and setup server
  const setupServer = () => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    if (retryTimesLeft > 0) {
      // reduce retry times
      retryTimesLeft -= 1;
      // TODO
      requestBeforeStartup(client)
        .then(() => {
          server.listen(__PORT__, '0.0.0.0', (err) => {
            if (err) {
              logger.log('error', 'server.listen', err);
            }
            console.info('----\n==> App is running, talking to API server on %s.', __APIHOST__);
            console.info('==> Open %s:%s in a browser to view the app.', __HOST__, __PORT__);
          });
        })
        .catch((err) => {
          logger.log('error', 'requestBeforeStartup', err);
          // make sure the server starts
          timer = setTimeout(setupServer, 10 * 1000);
        });
    }
  };
  setupServer();
} else {
  console.error('==> ERROR: No PORT environment variable has been specified');
}
