import {
  EcEnv,
  X_ACCESS_TOKEN,
  X_CART_TOKEN,
  X_CHANNEL,
  X_CHECKOUT_TOKEN,
  X_RETAIL_STORE_ID,
  X_SALES_ID,
  X_UID,
  X_EMAIL,
  X_WAREHOUSE_CODE_STOCK,
  X_WAREHOUSE_CODE_DISPLAY,
  accessInServer,
} from '@castlery/config';
import { logger } from '@castlery/observability';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { sharedFeatureService } from '@castlery/shared-services';

export const needAuthenticated = (): boolean => {
  return ['POS', 'WEB'].includes(EcEnv.NEXT_PUBLIC_CHANNEL);
};

export const sharedPrepareHeaders = async (headers: Headers, { extra }: { extra: ExtraArgument }) => {
  const { persistenceHandles, context } = extra as ExtraArgument;
  // @ts-ignore
  const cookieExtraParams = accessInServer && context?.req?.cookies ? { cookies: context.req.cookies } : null;
  const isPosUmsAuthMode = EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && sharedFeatureService.enabledPosUmsAuth;
  const posUmsWindow =
    typeof window === 'undefined'
      ? undefined
      : (window as Window & {
          __POS_UMS_GET_VALID_BEARER_TOKEN__?: () => Promise<string | null>;
        });

  // =============================== SHARED Headers ================================
  // 1. add `X_CHANNEL`
  if (!headers.has(X_CHANNEL)) {
    headers.set(X_CHANNEL, EcEnv.NEXT_PUBLIC_CHANNEL.toLocaleLowerCase());
  }
  // 2. add `X_ACCESS_TOKEN`
  if (!headers.has(X_ACCESS_TOKEN) && needAuthenticated()) {
    try {
      const token =
        EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB'
          ? persistenceHandles?.webAccessToken?.getItem({ ...cookieExtraParams })
          : persistenceHandles?.accessToken?.getItem();
      if (token) {
        headers.set(X_ACCESS_TOKEN, `${token}`);
      }
    } catch (error) {
      logger.error('Failed to set access token in request header', { error });
    }
  }
  // 1. add `X_CART_TOKEN`

  // ================================ WEB Only Headers ================================
  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
    if (headers.has(X_CART_TOKEN) && headers.get(X_CART_TOKEN) === 'true') {
      headers.delete(X_CART_TOKEN);
      const cartToken = persistenceHandles?.xCartToken?.getItem({ ...cookieExtraParams }) as string;
      if (cartToken) {
        headers.set(X_CART_TOKEN, cartToken as string);
      }
    }
    // 2. add `X_CHECKOUT_TOKEN`
    if (headers.has(X_CHECKOUT_TOKEN) && headers.get(X_CHECKOUT_TOKEN) === 'true') {
      headers.delete(X_CHECKOUT_TOKEN);
      const token = persistenceHandles?.xCheckoutSessionToken?.getItem();
      if (token) {
        headers.set(X_CHECKOUT_TOKEN, token as string);
      }
    }
  }

  // ================================ POS Only Headers ================================
  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'POS') {
    let token = persistenceHandles?.accessToken?.getItem();

    // Auth Bridge:
    // - legacy mode keeps `X-Access-Token`
    // - ums mode switches to the standard bearer token, while reusing the same
    //   business headers (`X_SALES_ID`, `X_RETAIL_STORE_ID`, etc.)
    if (isPosUmsAuthMode && !headers.has('Authorization')) {
      // 优先通过运行时入口拿有效 token；如果 silent renew 刚发生，这里会拿到更新后的 bearer token。
      token = (await posUmsWindow?.__POS_UMS_GET_VALID_BEARER_TOKEN__?.()) || token;
    }

    if (isPosUmsAuthMode && token && !headers.has('Authorization')) {
      // UMS 模式下业务接口统一走 Authorization，避免继续耦合 legacy 登录协议。
      headers.set('Authorization', token);
    }

    // 1. add `X_SALES_ID`，`X_RETAIL_STORE_ID`，`X_UID`(Optional)
    const posSalesId = persistenceHandles.posSalesId.getItem();
    const retailStoreId = persistenceHandles.retailId.getItem();
    const customerId = persistenceHandles.customerId.getItem();
    const temporaryCustomerEmail = persistenceHandles.temporaryCustomerEmail.getItem();
    const retailStockLocationType = persistenceHandles.retailStockLocationType.getItem();
    const retailDisplayLocationType = persistenceHandles.retailDisplayLocationType.getItem();
    if (posSalesId && !sharedFeatureService.enabledPosUmsAuth) {
      headers.set(X_SALES_ID, posSalesId);
    }
    if (retailStoreId) {
      headers.set(X_RETAIL_STORE_ID, retailStoreId);
    }
    if (customerId) {
      headers.set(X_UID, customerId);
      // just for pos joint testing , will remove it after integrated with UMS
      if (temporaryCustomerEmail) {
        headers.set(X_EMAIL, temporaryCustomerEmail);
      }
    }
    if (retailStockLocationType) {
      headers.set(X_WAREHOUSE_CODE_STOCK, retailStockLocationType);
    }
    if (retailDisplayLocationType) {
      headers.set(X_WAREHOUSE_CODE_DISPLAY, retailDisplayLocationType);
    }

    if (headers.has(X_CART_TOKEN) && headers.get(X_CART_TOKEN) === 'true') {
      headers.delete(X_CART_TOKEN);
      const cartToken = persistenceHandles?.xPosCartToken?.getItem({ ...cookieExtraParams }) as string;
      if (cartToken) {
        headers.set(X_CART_TOKEN, cartToken as string);
      }
    }
    // 2. add `X_CHECKOUT_TOKEN`
    if (headers.has(X_CHECKOUT_TOKEN) && headers.get(X_CHECKOUT_TOKEN) === 'true') {
      try {
        headers.delete(X_CHECKOUT_TOKEN);
        const sessionToken = persistenceHandles?.xCheckoutSessionToken?.getItem();
        const tokenObj = typeof sessionToken === 'string' ? JSON.parse(sessionToken) : null;
        if (tokenObj?.customerId?.toString() === customerId?.toString()) {
          headers.set(X_CHECKOUT_TOKEN, tokenObj.token as string);
        }
      } catch (error) {
        logger.error('Failed to set checkout token in request header', { error });
      }
    }
  }
  return headers;
};
