'use client';
import { setCollectionData, setOriginalMenuData } from '@castlery/modules-cms-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useRef } from 'react';

// 正常来说 不要把太多数据这么操作 因为这样让首屏带上过多的数据 导致 html 过大
export function MenuClient({ originalMenu, outerMenuData, collectionsData }) {
  const initialized = useRef(false);
  const dispatch = useAppDispatch();
  if (!initialized.current) {
    dispatch(setOriginalMenuData(originalMenu));
    dispatch(setCollectionData(collectionsData));
    initialized.current = true;
  }
  return <></>;
}
