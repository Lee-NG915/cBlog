'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useNiceModal } from '@castlery/fortress';

// 定义 UI Context 的类型 - 支持多种 UI 组件
interface UIContextType {
  // Modal 相关
  modal: ReturnType<typeof useNiceModal>[0];
  modalContextHolder: ReturnType<typeof useNiceModal>[1];

  // 未来可以添加其他 UI 组件
  // drawer: DrawerInstance;
  // toast: ToastInstance;
  // etc...
}

// 创建 Context
const UIContext = createContext<UIContextType | undefined>(undefined);

// UI Provider 组件 - 通用的 UI 组件提供者
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [modal, modalContextHolder] = useNiceModal();

  const value: UIContextType = {
    modal,
    modalContextHolder,
    // 未来可以在这里添加其他 UI 组件的实例
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      {modalContextHolder}
    </UIContext.Provider>
  );
};

// 自定义 Hook 用于在子组件中访问 UI 组件
export const useUIContext = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};
