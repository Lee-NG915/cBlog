'use client';

import {
  setShopTheLookData,
  // setCollectionData,
  setOriginalMenuData,
  setPlaPageStoryblok,
} from '@castlery/modules-cms-domain';
import { Product } from '@castlery/modules-product-domain';
import { initializeProduct } from '@castlery/modules-product-services';
import { useAppStore } from '@castlery/shared-redux-store';
import { PlaPageStoryblok, ShopTheLookDataV2Storyblok } from '@castlery/types';
import { useRef } from 'react';

// TODO @lychee27z 确认下 我这种写法 是否可以满足原本的设计
export function PageClient({
  productData,
  shopTheLook,
  originalMenuData,
  sbData,
}: {
  productData: Product;
  shopTheLook: ShopTheLookDataV2Storyblok | {};
  originalMenuData: any;
  sbData: PlaPageStoryblok;
}) {
  // const dispatch = useAppDispatch();
  const store = useAppStore();
  const initialized = useRef(false);

  if (!initialized.current) {
    // 这里的代码会在服务端和客户端都运行一遍
    // initializeProduct 的数据是从 RSC 获取的 所以这是一个同步获取,这样就会让 那些 client 的组件在服务端的时候也获取到数据
    store.dispatch(initializeProduct({ product: productData }));
    store.dispatch(setShopTheLookData(shopTheLook));
    store.dispatch(setOriginalMenuData(originalMenuData));
    store.dispatch(setPlaPageStoryblok(sbData));
    // store.dispatch(setCollectionData(null));// TODO @abbywang23 check if call api in any component or pla layout or global?   fetchFromKnightServer({ slugArray: ['taxonomies/collections'] }),
    // TODO @lychee27z 检查是否还缺失数据

    initialized.current = true;
  }

  return <></>;
}
