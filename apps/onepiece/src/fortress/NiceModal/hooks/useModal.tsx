import React from 'react';
import HookModal, { type HookModalRef, type WithoutActionInnerConfig } from '../components/HookModal';
import { ElementsHolder, type ElementsHolderRef } from './elementsHolder';
import { withFunc } from './withFunc';

/**
 * Refer To:
 * https://ant.design/components/modal
 * https://github.com/ant-design/ant-design/blob/master/components/modal/useModal/index.tsx
 */
let uuid = 0; /** uuid : Used to bind a key to each modal */
const destroyFns: Array<Function> = []; /** Collection of functions that destroy modal */

type ConfigUpdate = WithoutActionInnerConfig | ((prevConfig: WithoutActionInnerConfig) => WithoutActionInnerConfig);

type ModalFunc = (props: WithoutActionInnerConfig) => {
  destroy: () => void;
  update: (configUpdate: ConfigUpdate) => void;
  reset: (config: WithoutActionInnerConfig) => void;
};
type ModalStaticFunctions = Record<NonNullable<WithoutActionInnerConfig['type']>, ModalFunc>;
// Add `then` field for `ModalFunc` return instance.
export type ModalFuncWithPromise = (...args: Parameters<ModalFunc>) => ReturnType<ModalFunc> & {
  then<T>(resolve: (result: any) => T): Promise<T | void>;
};
export type HookAPI = Record<keyof ModalStaticFunctions, ModalFuncWithPromise>;

export function useNiceModal(): readonly [instance: HookAPI, contextHolder: React.ReactElement] {
  const holderRef = React.useRef<ElementsHolderRef>(null);
  const [actionQueue, setActionQueue] = React.useState<(() => void)[]>([]);

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
    (withFunc: (config: WithoutActionInnerConfig) => WithoutActionInnerConfig) =>
      function hookConfirm(config: WithoutActionInnerConfig) {
        uuid++;
        const modalRef = React.createRef<HookModalRef>();
        // Proxy to promise with `onClose`
        let resolvePromise: (result?: any) => void;
        const promise = new Promise<any>((resolve, reject = () => {}) => {
          resolvePromise = resolve;
        });
        let closeFunc: Function | undefined;
        const realConfig = {
          ...withFunc(config),
          ...(typeof config.onConfirm === 'function'
            ? {
                onConfirm: async () => {
                  if (config.onConfirm) {
                    const result = await config.onConfirm();
                    resolvePromise(result);
                  }
                },
              }
            : null),
        };

        const modal = <HookModal key={`modal_${uuid}`} config={realConfig} ref={modalRef}></HookModal>;
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
            let _config = typeof newConfig === 'function' ? newConfig(config) : newConfig;
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
            // console.log('----resolve>>>>', resolve);
            return promise.then(resolve);
          },
        };
        return instance;
      },
    []
  );
  const fns = React.useMemo<HookAPI>(
    () => ({
      information: getInstance(withFunc('information')),
      success: getInstance(withFunc('success')),
      warning: getInstance(withFunc('warning')),
      danger: getInstance(withFunc('danger')),
      formFill: getInstance(withFunc('formFill')),
    }),
    []
  );
  //contextHolder instanceof HTMLElement => false
  return [fns, <ElementsHolder key="modal-holder" ref={holderRef} />] as const;
}
