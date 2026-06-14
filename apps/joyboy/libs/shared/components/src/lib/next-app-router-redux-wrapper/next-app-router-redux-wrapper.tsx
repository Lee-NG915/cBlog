'use client';
import { useRef, ComponentType, FC } from 'react';
import { useAppStore } from '@castlery/shared-redux-store';
import { Action } from '@reduxjs/toolkit';

export type ActionCreator = () => Action;

interface WithReduxInitializationProps {
  actions: ActionCreator[];
}

export const withReduxInitialization = <P extends object>(
  WrappedComponent: ComponentType<P>
): FC<P & WithReduxInitializationProps> => {
  const ComponentWithInitialization: FC<P & WithReduxInitializationProps> = ({ actions, ...props }) => {
    // 服务端会执行初始化操作， 这里无法触发到 rtk 的 listener，手动初始化
    // 客户端会再执行一次初始化，两端的redux会保持一致
    const store = useAppStore();
    const initialized = useRef(false);
    if (!initialized.current) {
      actions.forEach((action) => store.dispatch(action()));
      initialized.current = true;
    }

    return <WrappedComponent {...(props as P)} />;
  };

  return ComponentWithInitialization;
};
