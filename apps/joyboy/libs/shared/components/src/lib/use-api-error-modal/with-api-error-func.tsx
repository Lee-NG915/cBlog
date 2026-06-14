import { WithoutActionInnerConfig, ModalType } from '@castlery/fortress';

export function withApiErrorFunc(type: ModalType) {
  return function (props: WithoutActionInnerConfig): WithoutActionInnerConfig {
    return {
      ...props,
      ...(type ? { [type]: true } : {}),
    };
  };
}
