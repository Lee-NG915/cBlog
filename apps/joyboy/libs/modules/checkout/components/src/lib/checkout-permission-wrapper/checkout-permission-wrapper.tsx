'use client';
import { redirect } from 'next/navigation';
import { getCheckoutPaths } from './paths';
import { useCheckoutPageContext } from './use-checkout-page-context';
import { useCheckoutPermissionState } from './use-checkout-permission-state';
import { resolveCheckoutRedirect } from './resolve-redirect';

const isServer = typeof window === 'undefined';

export const CheckoutPermissionWrapper = ({ children, orderId }: { children: React.ReactNode; orderId?: string }) => {
  const context = useCheckoutPageContext(orderId);
  const state = useCheckoutPermissionState(context.isOnAddressPage);
  const paths = getCheckoutPaths();

  // sessionStorage / cookies-next 在 SSR 阶段读不到，会把已登录用户误判为未登录而跳 cart。
  // 把权限判断推迟到客户端 render（刷新场景由此恢复正常）。
  if (isServer) return children;

  const target = resolveCheckoutRedirect(context, state, paths);
  if (target) redirect(target);

  return children;
};
