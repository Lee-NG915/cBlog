'use client';

import { useEffect } from 'react';

type JsToolProps = {
  blok: {
    _uid: string;
    usingScript?: boolean;
    scriptSrc?: string;
    jsCode?: string;
  };
};

const JsTool = ({ blok }: JsToolProps) => {
  const { _uid, usingScript, scriptSrc, jsCode } = blok;
  useEffect(() => {
    if (!document.getElementById(_uid) && usingScript && scriptSrc) {
      const script = document.createElement('script');
      script.id = _uid;
      script.src = scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [_uid, usingScript, scriptSrc]);
  useEffect(() => {
    if (jsCode) {
      // eslint-disable-next-line no-eval
      eval(jsCode);
    }
  }, [jsCode]);
  if (!scriptSrc && !jsCode) return null;
  return null;
};

export { JsTool };
