import * as React from 'react';
import { Container } from '@castlery/fortress';

// 账户模块布局 - 使用新的响应式侧边栏
export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <Container>{children}</Container>;
}
