import { EcEnv } from '@castlery/config';

// 全局变量类型声明
declare global {
  interface Window {
    affirm?: any;
  }
}

interface AffirmConfig {
  public_api_key: string;
  script: string;
}

export const loadAffirm = (): HTMLScriptElement | null => {
  if (!EcEnv.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY || !EcEnv.NEXT_PUBLIC_AFFIRM_SCRIPT) {
    return null;
  }
  const config: AffirmConfig = {
    public_api_key: EcEnv.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY,
    script: EcEnv.NEXT_PUBLIC_AFFIRM_SCRIPT,
  };

  // 创建 affirm 全局对象
  window.affirm = window.affirm || {};
  window.affirm.checkout = window.affirm.checkout || {};
  window.affirm.ui = window.affirm.ui || {};

  // 创建方法调用队列
  window.affirm.checkout._ = [];
  window.affirm.ui._ = [];

  // 创建占位方法，将调用存储到队列中
  const createStubMethod = (namespace: string, methodName: string) => {
    return (...args: any[]) => {
      window.affirm[namespace]._.push([methodName, args]);
    };
  };

  // 注册 checkout 方法
  const checkoutMethods = [
    'set',
    'add',
    'save',
    'post',
    'open',
    'empty',
    'reset',
    'on',
    'off',
    'trigger',
    'ready',
    'setProduct',
  ];
  checkoutMethods.forEach((method) => {
    window.affirm.checkout[method] = createStubMethod('checkout', method);
  });

  // 注册 UI 方法
  window.affirm.ui.ready = createStubMethod('ui', 'ready');

  // 注册实用方法（空函数）
  const utilMethods = ['get', 'token', 'url', 'items'];
  utilMethods.forEach((method) => {
    window.affirm.checkout[method] = () => {};
  });

  // 让 checkout 本身也可以被调用
  const originalCheckout = window.affirm.checkout;
  window.affirm.checkout = (config?: any) => {
    if (config) {
      originalCheckout.set(config);
    }
  };
  // 保留所有方法
  Object.assign(window.affirm.checkout, originalCheckout);

  // 异步加载 Affirm 脚本
  const script = document.createElement('script');
  script.async = true;
  script.src = config.script;

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);

  window.affirm.checkout(config);

  return script;
};

export type { AffirmConfig };
