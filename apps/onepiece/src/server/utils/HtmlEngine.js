import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import * as Sentry from '@sentry/node';
import Html from '../template/Html';
import logger from './logger';

const context = require.context('../../client', true, /Svg\.js$/, 'sync');
const svgCache = {};
(function (r) {
  r.keys().forEach((key) => {
    if (key === './Svg.js') return;
    const matcher = /\/(.*)Entry\//.exec(key);
    if (matcher[1]) {
      const entry = matcher[1].toLowerCase();
      const Svg = r(key).default;
      svgCache[entry] = renderToString(<Svg />);
    }
  });
})(context);

export default class HtmlEngine {
  constructor({ entry, namespace }) {
    this.entry = entry;
    this.namespace = namespace;
    this.extractor = new ChunkExtractor({
      statsFile: path.resolve(__dirname, `../client/loadable-stats.json`),
      entrypoints: [entry],
    });
  }

  render(component) {
    const jsx = this.extractor.collectChunks(component);
    let content;

    try {
      // console.log('renderToString', JSON.stringify(jsx));
      // console.log('renderToString', jsx);
      content = renderToString(jsx);
    } catch (err) {
      console.log('renderToString error', err);
      logger.log('error', 'renderToString error', err);
      // 上报到 Sentry（服务端）并附带上下文，便于定位 SSR 渲染错误
      try {
        Sentry.withScope((scope) => {
          scope.setTag('ssr', 'true');
          scope.setTag('phase', 'renderToString');
          scope.setExtra('entry', this.entry);
          if (this.namespace) {
            const req = this.namespace.get('req');
            if (req) {
              scope.setExtra('url', req.originalUrl || req.url);
              scope.setExtra('method', req.method);
              scope.setExtra('headers_user_agent', req.headers?.['user-agent']);
              scope.setExtra('headers_accept', req.headers?.accept);
            }
          }
          scope.setFingerprint(['ssr', 'renderToString']);
          Sentry.captureException(err);
        });
      } catch (_) {
        // ignore secondary reporting errors
      }
      // TODO: add error page
      // content = 'Sorry, something went wrong.';
    }

    const scriptElements = this.extractor.getScriptElements();
    const styleElements = this.extractor.getStyleElements();
    // const linkElements = this.extractor.getLinkElements();

    let insertedScripts;
    let insertedHeads;
    if (this.namespace) {
      const res = this.namespace.get('res');
      insertedScripts = res.insertedScripts;
      insertedHeads = res.insertedHeads;
    }
    // console.log('engine: ', insertedScripts);

    return `<!doctype html>\n${renderToString(
      <Html
        content={content}
        scriptElements={scriptElements}
        styleElements={styleElements}
        // linkElements={linkElements}
        insertedScripts={insertedScripts || {}}
        insertedHeads={insertedHeads || {}}
        svg={svgCache[this.entry] || ''}
      />
    )}`;
  }
}
