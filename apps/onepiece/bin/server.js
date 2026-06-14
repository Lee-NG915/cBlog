#!/usr/bin/env node
/* eslint-disable import/no-dynamic-require */
require('dotenv').config(); // load env sett ings from .env file
const tracer = require('dd-trace');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
// initialized with ENVIRONMENT VARIABLE DD_XXX, https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs/?tab=containers#configuration

/**
 * Define isomorphic constants.
 */
global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = process.env.DISABLE_SSR === 'true'; // DISABLES SERVER SIDE RENDERING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';
global.__COUNTRY__ = process.env.COUNTRY;

global.__PORT__ = process.env.PORT || 7777;
global.__STORY_BLOKS_REFRESH_INTERVAL__ = process.env.STORY_BLOKS_REFRESH_INTERVAL;

// Custom Global variables :REMOVE_ME
global.__FREE_SHIPPING_ZIPCODES__ = require('config/freeShippingZipcodes')[__COUNTRY__];

if (__DEVELOPMENT__) {
  const data = fs.readFileSync(
    path.join(rootDir, `./dist/onepiece/client/loadable-stats.json`),
    'utf-8'
  );
  global.assets = JSON.parse(data);
  require(`../dist/onepiece/server/app`);
} else {
  tracer.init({ runtimeMetrics: true });
  const data = fs.readFileSync(
    path.join(rootDir, `./static/onepiece/client/loadable-stats.json`),
    'utf-8'
  );
  global.assets = JSON.parse(data);
  require(`../static/onepiece/server/app`);
}
