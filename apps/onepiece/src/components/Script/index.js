import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { requestIdleCallback } from './request-idle-callback';

const ScriptCache = new Map();
const LoadCache = new Set();

const STRATEGY = {
  beforeInteractive: 'beforeInteractive',
  afterInteractive: 'afterInteractive',
  lazyOnload: 'lazyOnload',
  // worker:'worker'
};

const ignoreProps = ['onLoad', 'onReady', 'text', 'children', 'onError', 'strategy'];

export const DOMAttributeNames = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
  noModule: 'noModule',
};

const loadScript = (props) => {
  const { src, id, onLoad = () => {}, onReady = null, children = '', text, onError, strategy } = props;

  const cacheKey = id || src;

  // Script has already loaded
  if (cacheKey && LoadCache.has(cacheKey)) {
    return;
  }

  // Contents of this script are already loading/loaded
  if (ScriptCache.has(src)) {
    LoadCache.add(cacheKey);
    // It is possible that multiple `Script` components all have same "src", but has different "onLoad"
    // This is to make sure the same remote script will only load once, but "onLoad" are executed in order
    ScriptCache.get(src).then(onLoad, onError);
    return;
  }

  /** Execute after the script first loaded */
  const afterLoad = () => {
    // Run onReady for the first time after load event
    if (onReady) {
      onReady();
    }
    // add cacheKey to LoadCache when load successfully
    LoadCache.add(cacheKey);
  };

  const el = document.createElement('script');

  const loadPromise = new Promise((resolve, reject) => {
    el.addEventListener('load', function (e) {
      resolve();
      if (onLoad) {
        onLoad.call(this, e);
      }
      afterLoad();
    });
    el.addEventListener('error', (e) => {
      reject(e);
    });
  }).catch((e) => {
    if (onError) {
      onError(e);
    }
  });

  if (text) {
    el.innerHTML = text || '';

    afterLoad();
  } else if (children) {
    el.textContent = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';

    afterLoad();
  } else if (src) {
    el.src = src;
    // do not add cacheKey into LoadCache for remote script here
    // cacheKey will be added to LoadCache when it is actually loaded (see loadPromise above)
    ScriptCache.set(src, loadPromise);
  }

  for (const [k, value] of Object.entries(props)) {
    if (value === undefined || ignoreProps.includes(k)) {
      continue;
    }
    const attr = DOMAttributeNames[k] || k.toLowerCase();

    el.setAttribute(attr, value);
  }

  // if (strategy === 'worker') {
  //   el.setAttribute('type', 'text/partytown');
  // }

  el.setAttribute('data-nscript', strategy);

  document.body.appendChild(el);
};

function loadLazyScript(props) {
  if (document.readyState === 'complete') {
    requestIdleCallback(() => loadScript(props));
  } else {
    window.addEventListener('load', () => {
      requestIdleCallback(() => loadScript(props));
    });
  }
}
/**
 * Referenced from the [next/scirpt](https://nextjs.org/docs/basic-features/script) implementation
 *
 *  It is important to note that
 *  - beforeInteractive does not implement events and duplicate loading
 *  - worker is not implemented
 * @param {Function} props.onLoad [Executing Code After Loading (onLoad)](https://nextjs.org/docs/basic-features/script#executing-code-after-loading-onload)
 * @param {Function} props.onReady
 * @returns
 */
const Script = (props) => {
  const {
    id,
    src,
    onLoad,
    onReady = null,
    strategy = 'afterInteractive',
    onError,
    text = '',
    position = 'head',
    ...rest
  } = props;

  /**
   * - First mount:
   *   1. The useEffect for onReady executes
   *   2. hasOnReadyEffectCalled.current is false, but the script hasn't loaded yet (not in LoadCache)
   *      onReady is skipped, set hasOnReadyEffectCalled.current to true
   *   3. The useEffect for loadScript executes
   *   4. hasLoadScriptEffectCalled.current is false, loadScript executes
   *      Once the script is loaded, the onLoad and onReady will be called by then
   *   [If strict mode is enabled / is wrapped in <OffScreen /> component]
   *   5. The useEffect for onReady executes again
   *   6. hasOnReadyEffectCalled.current is true, so entire effect is skipped
   *   7. The useEffect for loadScript executes again
   *   8. hasLoadScriptEffectCalled.current is true, so entire effect is skipped
   *
   * - Second mount:
   *   1. The useEffect for onReady executes
   *   2. hasOnReadyEffectCalled.current is false, but the script has already loaded (found in LoadCache)
   *      onReady is called, set hasOnReadyEffectCalled.current to true
   *   3. The useEffect for loadScript executes
   *   4. The script is already loaded, loadScript bails out
   *   [If strict mode is enabled / is wrapped in <OffScreen /> component]
   *   5. The useEffect for onReady executes again
   *   6. hasOnReadyEffectCalled.current is true, so entire effect is skipped
   *   7. The useEffect for loadScript executes again
   *   8. hasLoadScriptEffectCalled.current is true, so entire effect is skipped
   */
  const hasOnReadyEffectCalled = useRef(false);

  useEffect(() => {
    const cacheKey = id || src;
    if (!hasOnReadyEffectCalled.current) {
      // Run onReady if script has loaded before but component is re-mounted
      if (onReady && cacheKey && LoadCache.has(cacheKey)) {
        onReady();
      }

      hasOnReadyEffectCalled.current = true;
    }
  }, [onReady, id, src]);

  const hasLoadScriptEffectCalled = useRef(false);

  // afterInteractive
  useEffect(() => {
    if (!hasLoadScriptEffectCalled.current) {
      if (strategy === STRATEGY.afterInteractive) {
        loadScript(props);
      } else if (strategy === STRATEGY.lazyOnload) {
        loadLazyScript(props);
      }
      hasLoadScriptEffectCalled.current = true;
    }
  }, [props, strategy]);

  if (__SERVER__ && strategy === STRATEGY.beforeInteractive) {
    // FIXME: Normally, we should provide an onRead event to
    // beforeInteractive, but the current code implementation is that
    // beforeInteractive does not perform any events (onRead , onLoad and onError)
    if (onError || onReady) {
      console.warn('beforeInteractive mode does not yet implement onRead and onLoad');
    }
    if (onLoad) {
      console.warn(
        `onLoad cannot be used with the beforeInteractive loading strategy.
           Consider using onReady instead.`
      );
    }

    const res = require('cls-hooked').getNamespace('castlery').get('res');
    // FIXME: Here there may be a problem of repeated references,
    // later if optimized, you can first exist in an array of data,
    // and then generate script tags in HtmlEngine.js
    res.insertedScripts = res.insertedScripts || {};
    res.insertedScripts[position] = res.insertedScripts[position] || [];
    const key = res.insertedScripts[position].length;

    res.insertedScripts[position].push(
      // FIXME props should be filtered  and  determine if the case of the property needs to be converted
      <script src={src} key={key} id={id} {...rest} dangerouslySetInnerHTML={{ __html: text }} />
    );
  }

  /**
   * FIXME: we need to improve this part in server side rendering
   */
  if (strategy === STRATEGY.beforeInteractive) {
    if (__CLIENT__)
      return window?.__DISABLE_SSR__ ? (
        <Helmet>{src ? <script src={src} id={id} {...rest} /> : text ? <script>{text}</script> : null}</Helmet>
      ) : null;
  }

  return null;
};

Script.propTypes = {
  strategy: PropTypes.oneOf(Object.values(STRATEGY)),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  onReady: PropTypes.func,
  id: PropTypes.string,
  src: PropTypes.string,
  position: PropTypes.string,
  text: PropTypes.string,
};

// FIXME: need to improve (the children would become a string, so do we need noscript?)
export const NoScript = ({ children, position = 'head', ...rest }) => {
  if (__SERVER__) {
    const res = require('cls-hooked').getNamespace('castlery').get('res');
    res.insertedScripts = res.insertedScripts || {};
    res.insertedScripts[position] = res.insertedScripts[position] || [];
    const key = res.insertedScripts[position].length;
    res.insertedScripts[position].push(
      <noscript key={key} {...rest}>
        {children}
      </noscript>
    );
  }
  return null;
};
NoScript.propTypes = {
  children: PropTypes.object,
  position: PropTypes.string,
};
export default Script;
