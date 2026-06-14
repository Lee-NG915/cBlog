/* eslint-env jest */
import { getCustomerServiceApi } from 'utils/customer-service/sdk-loader';
import Sidekick from './Sidekick';

jest.mock('react-redux', () => ({
  connect: () => (Component) => Component,
}));

jest.mock('utils/customer-service/sdk-loader', () => ({
  getCustomerServiceApi: jest.fn(),
}));

jest.mock('utils/track/constants', () => ({
  EVENT_INITIATE_CHAT: 'EVENT_INITIATE_CHAT',
}));

jest.mock('utils/time', () => ({
  getDate: () => ({
    diff: () => 0,
  }),
}));

const flushPromises = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe('Sidekick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not require the Customer Service SDK to expose getStatus', async () => {
    const api = {
      on: jest.fn(() => jest.fn()),
      setUser: jest.fn(),
      openChat: jest.fn(),
      clearUser: jest.fn(),
      getCurrentChannel: jest.fn(() => null),
    };
    getCustomerServiceApi.mockResolvedValue(api);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const sidekick = new Sidekick({
      user: null,
      trackInitChat: jest.fn(),
    });
    sidekick.setState = jest.fn((nextState) => {
      sidekick.state = { ...sidekick.state, ...nextState };
    });

    sidekick.componentDidMount();
    await flushPromises();

    expect(api.on).toHaveBeenCalledWith('channel_opened', expect.any(Function));
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      '[CustomerService] SDK initialization failed:',
      expect.any(TypeError)
    );

    consoleErrorSpy.mockRestore();
  });
});
