import { render } from '@testing-library/react';
import React from 'react';
import { StoreProvider } from '@castlery/shared-components';
import { ThemeProvider } from '@castlery/shared-components';
// Mock window.matchMedia
// 为 Jest 测试环境中模拟浏览器的 window.matchMedia 方法
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

(global as any).renderWithRedux = (ui: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </StoreProvider>
  );
};
