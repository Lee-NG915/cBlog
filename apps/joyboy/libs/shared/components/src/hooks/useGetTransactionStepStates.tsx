'use client';
import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { basePageConfig, EcEnv } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

export enum TransactionStepState {
  PENDING_CHECKOUT = 'PENDING_CHECKOUT',
  PENDING_AUTHENTICATION = 'PENDING_AUTHENTICATION',
  PENDING_EMPTY_CART = 'PENDING_EMPTY_CART',
  PENDING_SELECT_ADDRESS = 'PENDING_SELECT_ADDRESS',
  PENDING_SELECT_SHIPPING_METHOD = 'PENDING_SELECT_SHIPPING_METHOD',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  SUCCESS = 'SUCCESS',
  PENDING_PAYMENT_CALLBACK = 'PENDING_PAYMENT_CALLBACK',
}

const TRANSACTION_STEPS = [
  {
    path: basePageConfig['cart'],
    index: 1,
    state: TransactionStepState.PENDING_CHECKOUT,
    stepName: 'CART',
    useSingleChildLayout: false,
  },
  {
    path: basePageConfig['checkout-account'],
    index: 2,
    state: TransactionStepState.PENDING_AUTHENTICATION,
    stepName: 'CHECKOUT_ACCOUNT',
    useSingleChildLayout: true,
  },
  {
    path: basePageConfig['checkout-empty'],
    index: 3,
    state: TransactionStepState.PENDING_EMPTY_CART,
    stepName: 'CHECKOUT_EMPTY_CART',
    useSingleChildLayout: true,
  },
  {
    path: basePageConfig['checkout-shipping-address'],
    index: 4,
    state: TransactionStepState.PENDING_SELECT_ADDRESS,
    stepName: 'CHECKOUT_ADDRESS',
    useSingleChildLayout: false,
  },
  {
    path: basePageConfig['checkout-shipping-method'],
    index: 5,
    state: TransactionStepState.PENDING_SELECT_SHIPPING_METHOD,
    stepName: 'CHECKOUT_SHIPPING',
    useSingleChildLayout: false,
  },
  {
    path: basePageConfig['checkout-payment'],
    index: 6,
    state: TransactionStepState.PENDING_PAYMENT,
    stepName: 'CHECKOUT_PAYMENT',
    useSingleChildLayout: false,
  },
  {
    path: basePageConfig['checkout-success'],
    index: 7,
    state: TransactionStepState.SUCCESS,
    stepName: 'CHECKOUT_SUCCESS',
    useSingleChildLayout: true,
  },
  {
    path: basePageConfig['checkout-payment-callback'],
    index: 8,
    state: TransactionStepState.PENDING_PAYMENT_CALLBACK,
    stepName: 'CHECKOUT_PAYMENT_CALLBACK',
    useSingleChildLayout: true,
  },
];

const STEPS_BY_PATH_LENGTH = [...TRANSACTION_STEPS].sort((a, b) => b.path.length - a.path.length);

const ZIPCODE_STATES = new Set<TransactionStepState>([
  TransactionStepState.PENDING_CHECKOUT,
  TransactionStepState.PENDING_SELECT_ADDRESS,
]);

const COUPON_STATES = new Set<TransactionStepState>([
  TransactionStepState.PENDING_CHECKOUT,
  TransactionStepState.PENDING_SELECT_ADDRESS,
  TransactionStepState.PENDING_SELECT_SHIPPING_METHOD,
  TransactionStepState.PENDING_PAYMENT,
]);

const CHECKOUT_PERMISSION_STATES = new Set<TransactionStepState>([
  TransactionStepState.PENDING_SELECT_ADDRESS,
  TransactionStepState.PENDING_SELECT_SHIPPING_METHOD,
  TransactionStepState.PENDING_PAYMENT,
]);

const INVALID_SESSION_VALUES = new Set(['null', 'undefined']);

export const useGetTransactionStepStates = () => {
  const pathname = usePathname();
  const router = useRouter();
  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);

  const currentStep = useMemo(() => STEPS_BY_PATH_LENGTH.find((step) => pathname.includes(step.path)), [pathname]);

  const currentState = currentStep?.state ?? null;

  const stepStates = useMemo(
    () => ({
      enableUpdateZipcode: currentState !== null && ZIPCODE_STATES.has(currentState),
      enableUpdateCoupon: currentState !== null && COUPON_STATES.has(currentState),
    }),
    [currentState]
  );

  const getStepStates = useCallback(() => stepStates, [stepStates]);

  const hasCheckoutPermission = useMemo(() => {
    if (currentState === null || !CHECKOUT_PERMISSION_STATES.has(currentState)) {
      return true;
    }
    const sessionToken = persistenceHandles.xCheckoutSessionToken.getItem()?.trim();
    return !!sessionToken && !INVALID_SESSION_VALUES.has(sessionToken);
  }, [currentState, persistenceHandles]);

  const redirectToCartHandler = useCallback(() => {
    const cartPath = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig.cart}`;
    router.replace(cartPath);
  }, [router]);

  const backToPreviousStepHandler = useCallback(() => {
    if (!currentStep) return;
    const previousStepIndex = currentStep.index - 1;
    const previousStep = TRANSACTION_STEPS.find((step) => step.index === previousStepIndex);
    if (previousStep) {
      const pathPrefix = pathname.slice(0, pathname.indexOf(currentStep.path));
      router.replace(`${pathPrefix}${previousStep.path}`);
    }
  }, [currentStep, pathname, router]);

  return {
    getStepStates,
    currentStep,
    hasCheckoutPermission,
    redirectToCartHandler,
    backToPreviousStepHandler,
  };
};
