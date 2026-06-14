import type { SignoutRedirectArgs, User } from 'oidc-client-ts';
import { persistPosUmsBridgeSession } from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { getPosUmsConfigSnapshot } from './ums-auth.config';
import { loadOidcRuntime, assertBrowser } from './ums-auth.runtime';
import type { OidcUserManager, SigninState, UmsConfigSnapshot } from './types';

const managers = new Map<string, PosUmsAuthService>();

export class PosUmsAuthService {
  private renewUserPromise: Promise<User | null> | null = null;

  private constructor(
    private readonly locale: string,
    private readonly managerPromise: Promise<OidcUserManager>,
    private readonly config: UmsConfigSnapshot
  ) {}

  /**
   * 获取 PosUmsAuthService 实例。
   */
  static getInstance(locale: string): PosUmsAuthService {
    assertBrowser();
    const normalizedLocale = locale.trim().toLowerCase();
    const existing = managers.get(normalizedLocale);
    if (existing) {
      return existing;
    }

    const config = getPosUmsConfigSnapshot(normalizedLocale);
    const managerPromise = loadOidcRuntime().then(({ UserManager, WebStorageStateStore }) => {
      const manager = new UserManager({
        authority: config.issuer,
        client_id: config.clientId,
        response_type: 'code',
        scope: config.scope,
        redirect_uri: config.redirectUri,
        post_logout_redirect_uri: config.postLogoutRedirectUri,
        automaticSilentRenew: true,
        userStore: new WebStorageStateStore({ store: window.localStorage }),
      });

      manager.events.addUserLoaded((user) => {
        // silent renew / callback 重新加载用户后，同步桥接 token，保证业务请求读到的是最新 bearer token。
        void persistPosUmsBridgeSession(normalizedLocale, user);
      });

      return manager;
    });

    const service = new PosUmsAuthService(normalizedLocale, managerPromise, config);
    managers.set(normalizedLocale, service);
    return service;
  }

  /**
   * 获取 OidcUserManager 实例。
   */
  private async getManager(): Promise<OidcUserManager> {
    return this.managerPromise;
  }

  /**
   * 获取当前语言。
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   * 获取当前配置。
   */
  getConfigSnapshot(): UmsConfigSnapshot {
    return this.config;
  }

  /**
   * 获取本地存储的用户。
   */
  async getUser(): Promise<User | null> {
    const manager = await this.getManager();
    return manager.getUser();
  }

  /**
   * 获取本地存储的有效用户。
   */
  async getValidUser(): Promise<User | null> {
    const user = await this.getUser();

    if (!user) {
      return null;
    }

    if (!user.expired) {
      // 即便 user 仍然有效，也要把本地桥接 token 对齐，避免业务侧继续带历史 token。
      await this.syncBridgeSession(user);
      return user;
    }

    return this.renewUser();
  }

  /**
   * 同步本地存储的用户到桥接存储。
   */
  private async syncBridgeSession(user: User): Promise<void> {
    await persistPosUmsBridgeSession(this.locale, user);
  }

  /**
   * 续期用户。
   */
  async renewUser(): Promise<User | null> {
    if (this.renewUserPromise) {
      return this.renewUserPromise;
    }

    this.renewUserPromise = (async () => {
      try {
        // 所有续期都收敛到这里，避免并发请求各自 silent renew 造成 token 抖动。
        const user = await this.signinSilent();

        if (user) {
          await this.syncBridgeSession(user);
        }

        return user;
      } catch {
        await this.removeUser();
        return null;
      } finally {
        this.renewUserPromise = null;
      }
    })();

    return this.renewUserPromise;
  }

  /**
   * 把浏览器带到 IdP 的 authorization endpoint。
   */
  async signinRedirect(callbackUrl?: string): Promise<void> {
    const manager = await this.getManager();
    return manager.signinRedirect({
      state: {
        callbackUrl,
        locale: this.locale,
      } satisfies SigninState,
    });
  }

  /**
   * 处理来自 IdP 的 authorization endpoint 回调。
   */
  async signinRedirectCallback(url?: string): Promise<User> {
    const manager = await this.getManager();
    return manager.signinRedirectCallback(url);
  }

  /**
   * 执行 silent renew，续期用户。
   */
  async signinSilent(): Promise<User | null> {
    const manager = await this.getManager();
    return manager.signinSilent();
  }

  /**
   * 把浏览器带到 IdP 的 end-session endpoint。
   * logout-callback 不是去清 IdP 会话的，而是处理“IdP 已经登出完成”的回调。
   */
  async signoutRedirect(args?: SignoutRedirectArgs): Promise<void> {
    const manager = await this.getManager();
    return manager.signoutRedirect(args);
  }

  /**
   * 处理来自 IdP 的 end-session endpoint 回调。
   */
  async signoutRedirectCallback(url?: string) {
    const manager = await this.getManager();
    return manager.signoutRedirectCallback(url);
  }

  /**
   * 移除本地存储的用户。
   */
  async removeUser(): Promise<void> {
    const manager = await this.getManager();
    return manager.removeUser();
  }
}
