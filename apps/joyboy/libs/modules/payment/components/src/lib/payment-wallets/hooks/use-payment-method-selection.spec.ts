import { act, renderHook } from '@testing-library/react';
// 直接从 entity 文件导入 enum，绕开 @castlery/modules-payment-domain barrel
// 否则会触发 @castlery/config 在测试环境下的环境变量校验失败
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';
import { usePaymentMethodSelection } from './use-payment-method-selection';

jest.mock('@castlery/observability', () => ({
  TransactionDomain: { PAYMENT: 'payment' },
  trackTransactionSuccess: jest.fn(),
}));

jest.mock('@castlery/modules-payment-domain', () => ({
  PaymentMethodProviderEnum: jest.requireActual('../../../../../domain/src/lib/entity/payment-feature.entity')
    .PaymentMethodProviderEnum,
}));

type SupportedMethod = {
  key: PaymentMethodProviderEnum;
  provider: PaymentMethodProviderEnum;
  label: string;
  icons: string[];
  instructionText: string;
};

function makeMethod(key: PaymentMethodProviderEnum): SupportedMethod {
  return { key, provider: key, label: key, icons: [], instructionText: '' };
}

function buildSupportedMethods() {
  return [
    makeMethod(PaymentMethodProviderEnum.STRIPE_ONLINE),
    makeMethod(PaymentMethodProviderEnum.STRIPE_APPLE_PAY),
    makeMethod(PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY),
    makeMethod(PaymentMethodProviderEnum.STRIPE_LINK_PAY),
    makeMethod(PaymentMethodProviderEnum.PAYPAL_ONLINE),
  ];
}

function detectFlags(flags: { applePay?: boolean; googlePay?: boolean; link?: boolean }) {
  return {
    applePay: !!flags.applePay,
    googlePay: !!flags.googlePay,
    link: !!flags.link,
    amazonPay: false,
    paypal: false,
    klarna: false,
  };
}

const EXPRESS_KEYS = [
  PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
  PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
  PaymentMethodProviderEnum.STRIPE_LINK_PAY,
];

describe('usePaymentMethodSelection — express wallet priority filter', () => {
  type Case = {
    name: string;
    flags: { applePay?: boolean; googlePay?: boolean; link?: boolean };
    expectedExpress: PaymentMethodProviderEnum | null;
  };

  const cases: Case[] = [
    {
      name: 'macOS Safari (applePay + link) → only Apple Pay',
      flags: { applePay: true, link: true },
      expectedExpress: PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
    },
    {
      name: 'macOS Chrome (googlePay + link) → only Google Pay',
      flags: { googlePay: true, link: true },
      expectedExpress: PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
    },
    {
      name: 'iOS Safari (applePay + link) → only Apple Pay',
      flags: { applePay: true, link: true },
      expectedExpress: PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
    },
    {
      name: 'Android Chrome (googlePay + link) → only Google Pay',
      flags: { googlePay: true, link: true },
      expectedExpress: PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
    },
    {
      name: 'Link only (no apple/google) → Link Pay (fallback)',
      flags: { link: true },
      expectedExpress: PaymentMethodProviderEnum.STRIPE_LINK_PAY,
    },
    {
      name: 'No express wallet available → no express in list',
      flags: {},
      expectedExpress: null,
    },
    {
      name: 'Apple Pay + Google Pay both available → Apple Pay wins',
      flags: { applePay: true, googlePay: true },
      expectedExpress: PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
    },
  ];

  it.each(cases)('$name', ({ flags, expectedExpress }) => {
    const supportedMethods = buildSupportedMethods();
    const { result } = renderHook(() =>
      usePaymentMethodSelection({
        supportedMethods: supportedMethods as any,
        defaultSelectedKey: undefined,
        updatePaymentState: jest.fn(),
      })
    );

    act(() => {
      result.current.onExpressMethodsDetected(detectFlags(flags));
    });

    const visibleKeys = result.current.visibleMethods.map((m) => m.key);

    // non-express methods always remain visible
    expect(visibleKeys).toContain(PaymentMethodProviderEnum.STRIPE_ONLINE);
    expect(visibleKeys).toContain(PaymentMethodProviderEnum.PAYPAL_ONLINE);

    const visibleExpress = visibleKeys.filter((k) => EXPRESS_KEYS.includes(k));
    if (expectedExpress) {
      expect(visibleExpress).toEqual([expectedExpress]);
    } else {
      expect(visibleExpress).toEqual([]);
    }
  });

  it('initial render (before detection) hides all express wallets', () => {
    const { result } = renderHook(() =>
      usePaymentMethodSelection({
        supportedMethods: buildSupportedMethods() as any,
        defaultSelectedKey: undefined,
        updatePaymentState: jest.fn(),
      })
    );

    const visibleKeys = result.current.visibleMethods.map((m) => m.key);
    expect(visibleKeys).toContain(PaymentMethodProviderEnum.STRIPE_ONLINE);
    expect(visibleKeys).toContain(PaymentMethodProviderEnum.PAYPAL_ONLINE);
    expect(visibleKeys.filter((k) => EXPRESS_KEYS.includes(k))).toEqual([]);
  });
});
