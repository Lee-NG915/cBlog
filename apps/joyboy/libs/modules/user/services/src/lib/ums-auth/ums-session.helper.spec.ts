import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { clearPosBridgeSession } from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { clearPosUmsInfoCache } from './ums-api';
import { clearPosUmsLegacyRemnants, hasPosUmsSessionRemnants } from './ums-session.helper';

jest.mock('@castlery/shared-persistence-kit', () => ({
  makePersistenceHandles: jest.fn(),
}));

jest.mock('@castlery/shared-persistence-kit/lib/posAuthBridge', () => ({
  clearPosBridgeSession: jest.fn(),
}));

jest.mock('./ums-api', () => ({
  clearPosUmsInfoCache: jest.fn(),
}));

jest.mock('./ums-auth.service', () => ({
  PosUmsAuthService: {
    getInstance: jest.fn(),
  },
}));

describe('ums-session.helper', () => {
  const getItem = jest.fn();
  const localStorageStore = new Map<string, string>();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageStore.clear();
    getItem.mockReturnValue('');

    (makePersistenceHandles as jest.Mock).mockReturnValue({
      accessToken: { getItem },
    });

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: {
          get length() {
            return localStorageStore.size;
          },
          key: (index: number) => Array.from(localStorageStore.keys())[index] ?? null,
          getItem: (key: string) => localStorageStore.get(key) ?? null,
          setItem: (key: string, value: string) => {
            localStorageStore.set(key, value);
          },
          removeItem: (key: string) => {
            localStorageStore.delete(key);
          },
        },
      },
    });
  });

  describe('hasPosUmsSessionRemnants', () => {
    it('returns false when no UMS bridge token or OIDC storage exists', () => {
      getItem.mockReturnValue('legacy-token');

      expect(hasPosUmsSessionRemnants()).toBe(false);
    });

    it('returns true when accessToken still uses UMS bearer bridge format', () => {
      getItem.mockReturnValue('Bearer ums-token');

      expect(hasPosUmsSessionRemnants()).toBe(true);
    });

    it('returns true when OIDC local storage keys still exist', () => {
      localStorageStore.set('oidc.user:issuer:client', '{}');

      expect(hasPosUmsSessionRemnants()).toBe(true);
    });
  });

  describe('clearPosUmsLegacyRemnants', () => {
    it('clears bridge session, info cache, and OIDC storage without loading OIDC SDK', async () => {
      localStorageStore.set('oidc.user:issuer:client', '{}');

      await clearPosUmsLegacyRemnants({ locale: 'ca', clearRetailContext: true });

      expect(clearPosUmsInfoCache).toHaveBeenCalledTimes(1);
      expect(clearPosBridgeSession).toHaveBeenCalledWith({
        locale: 'ca',
        clearRetailContext: true,
      });
      expect(localStorageStore.has('oidc.user:issuer:client')).toBe(false);
    });
  });
});
