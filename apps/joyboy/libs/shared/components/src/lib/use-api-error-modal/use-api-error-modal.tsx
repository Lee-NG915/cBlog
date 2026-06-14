/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React from 'react';
import {
  HookModal,
  type HookModalRef,
  type WithoutActionInnerConfig,
  ElementsHolder,
  type ElementsHolderRef,
} from '@castlery/fortress';
import { withApiErrorFunc } from './with-api-error-func';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ItemsList, ItemsListProps } from './items-list';
import { logger } from '@castlery/observability';

/**
 * Refer To:
 * https://ant.design/components/modal
 * https://github.com/ant-design/ant-design/blob/master/components/modal/useModal/index.tsx
 */
let uuid = 0; /** uuid : Used to bind a key to each modal */
const destroyFns: Array<Function> = []; /** Collection of functions that destroy modal */

interface ApiErrorModalInnerConfig extends WithoutActionInnerConfig {
  code: string;
  translatePrefix: string;
  fallbackMessage?: string;
  isSystemInternalError?: boolean;
  customConfirmTextTslKey?: string;
  onConfirm?: () => void;
  itemsList?: ItemsListProps['items'];
}

type ConfigUpdate = ApiErrorModalInnerConfig | ((prevConfig: ApiErrorModalInnerConfig) => ApiErrorModalInnerConfig);

type ModalFunc = (props: ApiErrorModalInnerConfig) => {
  destroy: () => void;
  update: (configUpdate: ConfigUpdate) => void;
  reset: (config: ApiErrorModalInnerConfig) => void;
};
// Add `then` field for `ModalFunc` return instance.
export type ModalFuncWithPromise = (...args: Parameters<ModalFunc>) => ReturnType<ModalFunc> & {
  then<T>(resolve: (result: any) => T): Promise<T | void>;
};
export type ApiErrorModalAPI = Record<'error' | 'warning', ModalFuncWithPromise>;

export function useApiErrorModal(): readonly [instance: ApiErrorModalAPI, contextHolder: React.ReactElement] {
  const holderRef = React.useRef<ElementsHolderRef>(null);
  const [actionQueue, setActionQueue] = React.useState<(() => void)[]>([]);
  // Move useTranslation to the top level of the hook
  const { t } = useTranslation(LocalesNamespace.ERROR);

  //============================= Effect ============================
  React.useEffect(() => {
    if (actionQueue?.length) {
      const cloneQueue = [...actionQueue];
      cloneQueue.forEach((action) => {
        action();
      });
      setActionQueue([]);
    }
  }, [actionQueue]);
  //============================= Hook ==============================
  const getInstance = React.useCallback(
    (withApiErrorFunc: (config: ApiErrorModalInnerConfig) => ApiErrorModalInnerConfig) =>
      function hookConfirm(config: ApiErrorModalInnerConfig) {
        uuid++;
        const modalRef = React.createRef<HookModalRef>();
        let closeFunc: Function | undefined;
        let resolvePromise: (result?: any) => void;
        const {
          code,
          translatePrefix,
          fallbackMessage,
          isSystemInternalError,
          customConfirmTextTslKey,
          itemsList,
          ...restConfig
        } = config;
        // Use the t function from the hook scope with dynamic keyPrefix
        const getTranslation = (prefix: string, errorCode: string) => {
          try {
            const fullKey = `${prefix}.${errorCode}` as any;
            const translatedMessageObj = t(fullKey, { returnObjects: true });
            if (translatedMessageObj && typeof translatedMessageObj === 'object') {
              return translatedMessageObj as any;
            }
            return null;
          } catch (error) {
            logger.error('error', { error });
            return null;
          }
        };

        let title;
        let desc;
        let confirmText;
        let cancelText;

        if (isSystemInternalError) {
          title = t(`${translatePrefix}.title` as any);
          desc = fallbackMessage
            ? t(`${translatePrefix}.description` as any, { errorMessage: fallbackMessage })
            : t(`${translatePrefix}.description` as any);
          confirmText = t(`${translatePrefix}.confirm` as any);
        } else {
          const translationResult = getTranslation(translatePrefix, code);
          title = translationResult?.title;
          desc = translationResult?.description || fallbackMessage;
          confirmText = customConfirmTextTslKey
            ? translationResult?.[customConfirmTextTslKey]
            : translationResult?.confirm;
          cancelText = translationResult?.cancel ? translationResult.cancel : undefined;
        }

        const modalConfig = {
          title: title || 'Oops!',
          desc: desc || 'Something went wrong. Please try again later.',
          confirmText: confirmText || 'OKAY',
          showCancelBtn: !!cancelText,
          ...(cancelText ? { cancelText } : {}),
          ...restConfig,
          ...(Array.isArray(itemsList) && itemsList?.length > 0 ? { content: <ItemsList items={itemsList} /> } : {}),
        };

        const promise = new Promise<any>((resolve, reject = () => {}) => {
          resolvePromise = resolve;
        });

        const realConfig = {
          ...withApiErrorFunc(modalConfig as ApiErrorModalInnerConfig),
          ...(typeof modalConfig.onConfirm === 'function'
            ? {
                onConfirm: async () => {
                  if (modalConfig.onConfirm) {
                    const result = await modalConfig.onConfirm();
                    resolvePromise(result);
                  }
                },
              }
            : null),
        };

        const modal = <HookModal key={`api_error_modal_${uuid}`} config={realConfig} ref={modalRef}></HookModal>;
        // eslint-disable-next-line prefer-const
        closeFunc = holderRef.current?.patchElement(modal);
        if (closeFunc) {
          destroyFns.push(closeFunc);
        }
        const instance: ReturnType<ModalFuncWithPromise> = {
          destroy: () => {
            function destroyAction() {
              modalRef.current?.destroy();
            }
            if (modalRef.current) {
              destroyAction();
            } else {
              setActionQueue((pre) => [...pre, destroyAction]);
            }
          },
          update: (newConfig: ConfigUpdate) => {
            const _config = typeof newConfig === 'function' ? newConfig(config) : newConfig;
            function updateAction() {
              modalRef.current?.update(_config);
            }
            if (modalRef.current) {
              updateAction();
            } else {
              setActionQueue((pre) => [...pre, updateAction]);
            }
          },
          reset: (newConfig: WithoutActionInnerConfig) => {
            function resetAction() {
              modalRef.current?.reset(newConfig);
            }
            if (modalRef.current) {
              resetAction();
            } else {
              setActionQueue((pre) => [...pre, resetAction]);
            }
          },
          then: (resolve) => {
            return promise.then(resolve);
          },
        };
        return instance;
      },
    [t]
  );
  const fns = React.useMemo<ApiErrorModalAPI>(
    () => ({
      error: getInstance(withApiErrorFunc('danger') as any),
      warning: getInstance(withApiErrorFunc('warning') as any),
    }),
    [getInstance]
  );
  //contextHolder instanceof HTMLElement => false
  return [fns, <ElementsHolder key="api_error_modal_holder" ref={holderRef} />] as const;
}
