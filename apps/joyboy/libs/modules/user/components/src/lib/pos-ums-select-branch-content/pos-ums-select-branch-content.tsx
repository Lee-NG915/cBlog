'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useNiceModal } from '@castlery/fortress';
import { locales, posRoutes } from '@castlery/config';
import {
  canPosUmsAccess,
  clearPosUmsLoginSession,
  clearPosUmsInfoCache,
  initializePosSessionByRetail,
  POS_UMS_PERMISSIONS,
  PosUmsAuthService,
  syncPosUmsPermissions,
} from '@castlery/modules-user-services';
import {
  resetPosUmsPermission,
  resetPosUmsUserInfo,
  selectedPosUmsPermissionState,
} from '@castlery/modules-user-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit/lib/persistenceHandles';
import {
  normalizePosCallbackUrl,
  persistPosUmsBridgeSession,
} from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { useGetRetailsQuery } from '@castlery/modules-retails-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { PermissionLoading } from '@castlery/shared-components';
import {
  PosUmsLoginRecoveryModal,
  POS_UMS_BRANCH_BANNER_IMAGE,
  PosUmsSelectionScreen,
} from '../pos-ums-selection-screen/pos-ums-selection-screen';

type PosUmsSelectBranchContentProps = {
  onSuccess?: ({ retailId, callbackUrl }: { retailId: number; callbackUrl?: string }) => Promise<void> | void;
};

type LoginState = 'checking' | 'logged-out' | 'logged-in' | 'error';
type PendingAction = 'login' | 'branch' | 'auto-continue' | null;
type RecoveryModalState = {
  open: boolean;
  title: string;
  description: string;
};

const LOGIN_RECOVERY_MODAL_INITIAL_STATE: RecoveryModalState = {
  open: false,
  title: '',
  description: '',
};

const LOGIN_BOOTSTRAP_TIMEOUT_MS = 15000;

function buildCountrySelectionUrl(callbackUrl?: string, deniedRegion?: string) {
  const searchParams = new URLSearchParams();

  if (callbackUrl) {
    searchParams.set('callbackUrl', callbackUrl);
  }

  if (deniedRegion) {
    searchParams.set('deniedRegion', deniedRegion);
  }

  const query = searchParams.toString();

  return query ? `/?${query}` : '/';
}

export function PosUmsSelectBranchContent({ onSuccess }: PosUmsSelectBranchContentProps) {
  const params = useParams<{ locale: string }>();
  const [modal, modalContextHolder] = useNiceModal();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const permissionState = useAppSelector(selectedPosUmsPermissionState);
  const searchParams = useSearchParams();
  const locale = params?.locale || 'ca';
  const callbackUrl = useMemo(() => {
    return normalizePosCallbackUrl(locale, searchParams?.get('callbackUrl') || undefined);
  }, [locale, searchParams]);
  const isChangeStoreFlow = searchParams?.get('changeStore') === '1';
  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);
  const [loginState, setLoginState] = useState<LoginState>('checking');
  const [autoContinueRetailId, setAutoContinueRetailId] = useState('');
  const [activeRetailId, setActiveRetailId] = useState('');
  const [recoveryModal, setRecoveryModal] = useState<RecoveryModalState>(LOGIN_RECOVERY_MODAL_INITIAL_STATE);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [authService, setAuthService] = useState<PosUmsAuthService | null>(null);
  const [cachedRetailOptions, setCachedRetailOptions] = useState<Array<{ label: string; value: string }>>([]);
  const hasTriggeredAutoLoginRef = useRef(false);
  const {
    currentData: retails,
    isFetching: isRetailsFetching,
    isError: isRetailsError,
  } = useGetRetailsQuery(undefined, {
    skip: loginState !== 'logged-in',
  });

  const marketLabel = useMemo(() => locales.find((l) => l.value === locale)?.label || '', [locale]);
  const retailOptions = useMemo(() => {
    return retails?.map((retail) => ({
      label: retail.name,
      value: String(retail.id),
    }));
  }, [retails]);
  const displayRetailOptions = retailOptions?.length ? retailOptions : cachedRetailOptions;
  const hasDisplayRetailOptions = displayRetailOptions.length > 0;
  const hasPageAccess = useMemo(() => {
    return canPosUmsAccess(permissionState, POS_UMS_PERMISSIONS.posPagesRead);
  }, [permissionState]);
  const isBusy = pendingAction !== null;
  const shouldShowLoading =
    loginState === 'checking' ||
    pendingAction === 'login' ||
    (loginState === 'logged-out' && !recoveryModal.open) ||
    (loginState === 'logged-in' && isRetailsFetching && !hasDisplayRetailOptions);

  const showWarningModal = useCallback(
    (content: string) => {
      modal.warning({
        title: 'Oops!',
        content,
        showCancelBtn: false,
        confirmText: 'Got it',
        onConfirm: () => {
          router.refresh();
        },
      });
    },
    [modal, router]
  );

  const presentRecoveryModal = useCallback((title: string, description: string) => {
    // 登录流故障需要显式退出 loading 状态，否则页面会被 loading 分支持续吞掉。
    hasTriggeredAutoLoginRef.current = true;
    setPendingAction(null);
    setActiveRetailId('');
    setAutoContinueRetailId('');
    setLoginState('error');
    setRecoveryModal({
      open: true,
      title,
      description,
    });
  }, []);

  const clearRetailSelectionContext = useCallback(() => {
    persistenceHandles.retailId.removeItem();
    persistenceHandles.retailStockLocationType.removeItem();
    persistenceHandles.retailDisplayLocationType.removeItem();
  }, [persistenceHandles]);

  const handleAfterBranchSelected = useCallback(
    async (retailId: string) => {
      if (onSuccess) {
        await onSuccess({
          retailId: Number(retailId),
          callbackUrl,
        });
        return;
      }

      if (callbackUrl) {
        await router.replace(callbackUrl);
      } else {
        await router.replace(posRoutes.products);
      }
    },
    [callbackUrl, onSuccess, router]
  );

  const initializeBranchContext = useCallback(
    async (retailId: string) => {
      await dispatch(
        initializePosSessionByRetail({
          retailId,
        })
      ).unwrap();
    },
    [dispatch]
  );

  const handleChangeCountry = useCallback(async () => {
    setRecoveryModal(LOGIN_RECOVERY_MODAL_INITIAL_STATE);
    setCachedRetailOptions([]);
    clearRetailSelectionContext();
    clearPosUmsInfoCache();
    dispatch(resetPosUmsPermission());
    dispatch(resetPosUmsUserInfo());
    await router.replace(buildCountrySelectionUrl(callbackUrl));
  }, [callbackUrl, clearRetailSelectionContext, dispatch, router]);

  const handleAccessRevoked = useCallback(async () => {
    setRecoveryModal(LOGIN_RECOVERY_MODAL_INITIAL_STATE);
    setPendingAction(null);
    setActiveRetailId('');
    setAutoContinueRetailId('');
    setCachedRetailOptions([]);
    dispatch(resetPosUmsPermission());
    dispatch(resetPosUmsUserInfo());
    clearPosUmsInfoCache();

    const service = authService || PosUmsAuthService.getInstance(locale);
    if (!authService) {
      setAuthService(service);
    }

    try {
      await service.signoutRedirect({
        state: {
          postLogoutRedirectPath: buildCountrySelectionUrl(callbackUrl, locale),
        },
      });
      return;
    } catch {
      await clearPosUmsLoginSession({
        locale,
        clearRetailContext: true,
        authService: service,
      });
      await router.replace(buildCountrySelectionUrl(callbackUrl, locale));
    }
  }, [authService, callbackUrl, dispatch, locale, router]);

  /**
   * 按当前实现，handleRetryLogin 只清理状态并把页面重新放回“可自动登录”的状态，就足够重新进入登录流程，不需要再显式调用一次 signinRedirect。
   */
  const handleRetryLogin = useCallback(async () => {
    const service = authService || PosUmsAuthService.getInstance(locale);
    if (!authService) {
      setAuthService(service);
    }

    setRecoveryModal(LOGIN_RECOVERY_MODAL_INITIAL_STATE);
    clearPosUmsInfoCache();
    dispatch(resetPosUmsPermission());
    dispatch(resetPosUmsUserInfo());
    setPendingAction(null);
    setActiveRetailId('');
    setAutoContinueRetailId('');
    setCachedRetailOptions([]);

    await clearPosUmsLoginSession({ locale, authService: service });

    hasTriggeredAutoLoginRef.current = false;
    setLoginState('logged-out');
  }, [authService, dispatch, locale]);

  useEffect(() => {
    if (!isChangeStoreFlow) {
      return;
    }

    // `changeStore=1` 只表示“进入 branch 选择页准备切换”，
    // 不是“当前 store 已经失效”。
    // 这里保留本地 retail context，避免用户未确认切换就退出/后退时丢失原有 store。
    // 真正更新 retailId 只发生在用户点击新 branch 并完成初始化之后。
    setAutoContinueRetailId('');
  }, [isChangeStoreFlow]);

  useEffect(() => {
    if (!retailOptions?.length) {
      return;
    }

    setCachedRetailOptions(retailOptions);
  }, [retailOptions]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuthState() {
      try {
        const service = PosUmsAuthService.getInstance(locale);
        if (mounted) {
          setAuthService(service);
        }

        const user = await service.getValidUser();
        if (!mounted) return;

        if (!user) {
          await clearPosUmsLoginSession({ locale, authService: service });
          dispatch(resetPosUmsPermission());
          dispatch(resetPosUmsUserInfo());
          if (!mounted) return;
          hasTriggeredAutoLoginRef.current = false;
          setLoginState('logged-out');
          return;
        }

        // 每次回到 login 页面时都重新对齐一次 bridge 持久化，
        // 保证 middleware、RTK Query 和当前页面看到的是同一份登录态。
        await persistPosUmsBridgeSession(locale, user);
        const nextPermissionState = await dispatch(syncPosUmsPermissions({ locale })).unwrap();

        if (!mounted) return;

        if (!canPosUmsAccess(nextPermissionState, POS_UMS_PERMISSIONS.posPagesRead)) {
          await handleAccessRevoked();
          return;
        }

        const retailId = isChangeStoreFlow ? '' : persistenceHandles.retailId.getItem();
        if (!mounted) return;

        setLoginState('logged-in');

        // 保持旧体验：如果本地已有 retailId，则在 getCurrentAdmin 完成后自动继续进入业务页。
        if (retailId) {
          setAutoContinueRetailId(retailId);
        }
      } catch {
        if (mounted) {
          clearPosUmsInfoCache();
          dispatch(resetPosUmsPermission());
          dispatch(resetPosUmsUserInfo());
          presentRecoveryModal(
            'Unable to continue',
            "We couldn't complete the login setup. Re-login to try again, or return to Select Country."
          );
        }
      }
    }

    initializeAuthState();

    return () => {
      mounted = false;
    };
  }, [callbackUrl, dispatch, handleAccessRevoked, isChangeStoreFlow, locale, persistenceHandles, presentRecoveryModal]);

  useEffect(() => {
    if (loginState !== 'logged-out' || !authService || pendingAction !== null || hasTriggeredAutoLoginRef.current) {
      return;
    }

    const service = authService;
    hasTriggeredAutoLoginRef.current = true;

    async function redirectToUmsLogin() {
      try {
        setPendingAction('login');
        await service.signinRedirect(callbackUrl);
      } catch {
        presentRecoveryModal(
          'Unable to open login',
          "We couldn't redirect you to Microsoft login. Re-login to try again, or return to Select Country."
        );
      }
    }

    redirectToUmsLogin();
  }, [authService, callbackUrl, loginState, pendingAction, presentRecoveryModal]);

  useEffect(() => {
    if (loginState !== 'logged-in' || !isRetailsError || recoveryModal.open || hasDisplayRetailOptions) {
      return;
    }

    presentRecoveryModal(
      'Unable to load stores',
      "We couldn't load your store list. Re-login to refresh your session, or return to Select Country."
    );
  }, [hasDisplayRetailOptions, isRetailsError, loginState, presentRecoveryModal, recoveryModal.open]);

  useEffect(() => {
    if (recoveryModal.open) {
      return;
    }

    const loadingScenario =
      loginState === 'checking'
        ? 'bootstrap'
        : pendingAction === 'login'
        ? 'redirect'
        : loginState === 'logged-in' && isRetailsFetching && !hasDisplayRetailOptions
        ? 'stores'
        : null;

    if (!loadingScenario) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (loadingScenario === 'bootstrap') {
        presentRecoveryModal(
          'Login is taking too long',
          "We couldn't finish preparing your login session. Re-login to try again, or return to Select Country."
        );
        return;
      }

      if (loadingScenario === 'redirect') {
        presentRecoveryModal(
          'Login is taking too long',
          "We couldn't complete the redirect to Microsoft login. Re-login to try again, or return to Select Country."
        );
        return;
      }

      presentRecoveryModal(
        'Loading stores is taking too long',
        "We couldn't finish loading your store list. Re-login to refresh your session, or return to Select Country."
      );
    }, LOGIN_BOOTSTRAP_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasDisplayRetailOptions, isRetailsFetching, loginState, pendingAction, presentRecoveryModal, recoveryModal.open]);

  useEffect(() => {
    if (!autoContinueRetailId) {
      return;
    }

    let cancelled = false;

    async function continueWithRememberedBranch() {
      try {
        setPendingAction('auto-continue');
        setActiveRetailId(autoContinueRetailId);
        await initializeBranchContext(autoContinueRetailId);
        await handleAfterBranchSelected(autoContinueRetailId);
      } catch {
        if (!cancelled) {
          showWarningModal('Failed to initialize the account context. Please sign out and try again.');
        }
      } finally {
        if (!cancelled) {
          setActiveRetailId('');
          setPendingAction(null);
          setAutoContinueRetailId('');
        }
      }
    }

    continueWithRememberedBranch();

    return () => {
      cancelled = true;
    };
  }, [autoContinueRetailId, handleAfterBranchSelected, initializeBranchContext, showWarningModal]);

  const handleSelectRetail = useCallback(
    async (retailId: string) => {
      if (!hasPageAccess) {
        await handleAccessRevoked();
        return;
      }

      setPendingAction('branch');
      setActiveRetailId(retailId);

      try {
        await initializeBranchContext(retailId);
        await handleAfterBranchSelected(retailId);
      } catch {
        showWarningModal('Failed to initialize the account context. Please sign out and try again.');
      } finally {
        setPendingAction(null);
        setActiveRetailId('');
      }
    },
    [handleAccessRevoked, handleAfterBranchSelected, hasPageAccess, initializeBranchContext, showWarningModal]
  );

  return (
    <>
      {modalContextHolder}
      {shouldShowLoading ? (
        <PermissionLoading />
      ) : (
        <>
          <PosUmsSelectionScreen
            bannerImage={POS_UMS_BRANCH_BANNER_IMAGE}
            heroTitle={`Castlery POS - ${marketLabel}`}
            title="Select Store"
            options={displayRetailOptions.map((retail) => ({
              value: retail.value,
              label: retail.label,
              loading:
                activeRetailId === retail.value && (pendingAction === 'branch' || pendingAction === 'auto-continue'),
              disabled: isBusy && activeRetailId !== retail.value,
              onClick: async () => {
                await handleSelectRetail(retail.value);
              },
            }))}
            footerActionLabel="Change Country"
            onFooterAction={handleChangeCountry}
          />
          <PosUmsLoginRecoveryModal
            open={recoveryModal.open}
            title={recoveryModal.title}
            description={recoveryModal.description}
            onRetryLogin={handleRetryLogin}
            onSelectRegion={handleChangeCountry}
          />
        </>
      )}
    </>
  );
}
