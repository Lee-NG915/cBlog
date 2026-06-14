'use client';

import { useAppStore } from '@castlery/shared-redux-store';
import { useRef } from 'react';

export function PageClient() {
  // const dispatch = useAppDispatch();
  const store = useAppStore();
  const initialized = useRef(false);

  if (!initialized.current) {
    // 如果要求组件在服务端要拿到接口进行渲染的话, 在page.tax(RSC)获取数据后
    // 在这里进行  store.dispatch 把数据注入到redux中
    // eg
    // store.dispatch(setShsopTheLookData(shopTheLook));

    initialized.current = true;
  }

  return null;
}
