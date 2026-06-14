import { createCustomerServiceSdkInitOptions } from './sdk-loader';

jest.mock('@castlery/config', () => ({
  EcEnv: {
    NEXT_PUBLIC_APPLICATION_ENV: 'sg-uat',
    NEXT_PUBLIC_COUNTRY: 'SG',
  },
}));

jest.mock('@castlery/observability', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('@castlery/shared-services', () => ({
  registerCustomerServiceClearUser: jest.fn(),
}));

describe('createCustomerServiceSdkInitOptions', () => {
  beforeEach(() => {
    delete window.__CASA_CONFIG__;
    delete window.__CASA_ENV_CONFIG__;
  });

  it('leaves Casa config undefined when remote Casa config is missing', () => {
    const options = createCustomerServiceSdkInitOptions();

    expect(options.getConfig().casaConfig).toBeUndefined();
  });

  it('keeps the remote Casa config when it is available', () => {
    window.__CASA_CONFIG__ = {
      enabled: false,
      supportMarket: ['US'],
      currentMarket: 'US',
      version: 'remote',
    };

    const options = createCustomerServiceSdkInitOptions();

    expect(options.getConfig().casaConfig).toBe(window.__CASA_CONFIG__);
  });
});
