import type { ModalType, WithoutActionInnerConfig } from '../components/HookModal';

/**
 * Extend props
 * @param type
 * @returns (props:WithFuncProps) => WithoutActionInnerConfig
 */
export function withFunc(type: ModalType) {
  return function (props: WithoutActionInnerConfig): WithoutActionInnerConfig {
    return {
      ...props,
      ...(type ? { [type]: true } : {}),
    };
  };
}
