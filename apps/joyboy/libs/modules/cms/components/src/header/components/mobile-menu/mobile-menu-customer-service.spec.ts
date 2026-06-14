import { openMenuCustomerServiceChat } from './mobile-menu-customer-service';

describe('openMobileMenuCustomerServiceChat', () => {
  it('opens chat through the SDK before using the host fallback', async () => {
    const openChat = jest.fn().mockResolvedValue(undefined);
    const getCustomerServiceApi = jest.fn().mockResolvedValue({ openChat });
    const fallback = jest.fn();
    const closeDrawer = jest.fn();

    await openMenuCustomerServiceChat({
      closeDrawer,
      fallback,
      getCustomerServiceApi,
    });

    expect(closeDrawer).toHaveBeenCalledTimes(1);
    expect(getCustomerServiceApi).toHaveBeenCalledTimes(1);
    expect(openChat).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('uses the host fallback only when the SDK cannot open chat', async () => {
    const getCustomerServiceApi = jest.fn().mockRejectedValue(new Error('SDK unavailable'));
    const fallback = jest.fn();

    await openMenuCustomerServiceChat({
      closeDrawer: jest.fn(),
      fallback,
      getCustomerServiceApi,
    });

    expect(fallback).toHaveBeenCalledTimes(1);
  });
});
