import { act, renderHook } from '@testing-library/react';
import { useCasaEnabled } from './use-casa-enabled';
import { getCustomerServiceApi } from '../lib/customer-service/sdk-loader';
import type { CustomerServiceApi, CustomerServiceEventMap } from '../lib/customer-service/sdk-types';

jest.mock('../lib/customer-service/sdk-loader', () => ({
  getCustomerServiceApi: jest.fn(),
}));

const mockGetCustomerServiceApi = getCustomerServiceApi as jest.MockedFunction<typeof getCustomerServiceApi>;

describe('useCasaEnabled', () => {
  let channelChangedListener: ((payload: CustomerServiceEventMap['channel_changed']) => void) | undefined;
  let readyListener: ((payload: CustomerServiceEventMap['ready']) => void) | undefined;
  let unsubscribe: jest.Mock;
  let api: Pick<CustomerServiceApi, 'on'>;
  let setIntervalSpy: jest.SpyInstance;

  beforeEach(() => {
    channelChangedListener = undefined;
    readyListener = undefined;
    unsubscribe = jest.fn();
    api = {
      on: jest.fn((event, listener) => {
        if (event === 'ready') {
          readyListener = listener as (payload: CustomerServiceEventMap['ready']) => void;
        }
        if (event === 'channel_changed') {
          channelChangedListener = listener as (payload: CustomerServiceEventMap['channel_changed']) => void;
        }
        return unsubscribe;
      }),
    };
    mockGetCustomerServiceApi.mockResolvedValue(api as CustomerServiceApi);
    setIntervalSpy = jest.spyOn(window, 'setInterval');
  });

  afterEach(() => {
    setIntervalSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('uses the switcher resolved channel instead of the active chat channel', async () => {
    const { result, unmount } = renderHook(() => useCasaEnabled());

    expect(result.current).toBe(false);

    await act(async () => {
      await Promise.resolve();
    });

    expect(api.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(api.on).toHaveBeenCalledWith('channel_changed', expect.any(Function));
    expect(setIntervalSpy).not.toHaveBeenCalled();

    act(() => {
      readyListener?.({ defaultChannel: 'casa' });
    });

    expect(result.current).toBe(true);

    act(() => {
      channelChangedListener?.({ from: 'casa', to: 'gladly' });
    });

    expect(result.current).toBe(false);

    act(() => {
      channelChangedListener?.({ from: 'gladly', to: 'casa' });
    });

    expect(result.current).toBe(true);

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });
});
