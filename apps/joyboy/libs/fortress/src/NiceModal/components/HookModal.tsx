import React from 'react';
import NiceModal, { type NiceModalProps } from './BaseModal';
import FormModal, { type TFormProps } from './FormModal';

/**
 * Type value that can be used when calling imperatively
 * eg: modal.info({...modalProps})
 */
export type ModalType = 'success' | 'info' | 'warning' | 'danger' | 'formFill' | 'confirmation';
export interface UseModalOwnProps {
  content?: React.ReactNode;
  type?: ModalType;
}

export interface ModalFuncProps extends Omit<NiceModalProps & Partial<TFormProps>, 'children'> {
  content?: React.ReactNode;
  type?: ModalType;
}
/** HookModal has built-in open and onClose, no need to pass them in. */
export type WithoutActionInnerConfig = Omit<ModalFuncProps, 'open' | 'onClose'> & { onClose?: () => void };
export interface HookModalRef {
  update: (config: WithoutActionInnerConfig) => void;
  reset: (config: WithoutActionInnerConfig) => void;
  destroy: () => void;
}

export interface HookModalProps {
  config: WithoutActionInnerConfig;
}
const HookModal: React.ForwardRefRenderFunction<HookModalRef, HookModalProps> = ({ config }, ref) => {
  const [open, setOpen] = React.useState<boolean>(true);
  const [innerConfig, setInnerConfig] = React.useState<WithoutActionInnerConfig>(config);

  const onClose = () => setOpen(false);

  React.useImperativeHandle(ref, () => ({
    destroy: onClose,
    update: (newConfig: WithoutActionInnerConfig) => {
      setInnerConfig((originConfig) => ({
        ...originConfig,
        ...newConfig,
      }));
    },
    reset: (newConfig: WithoutActionInnerConfig) => {
      setInnerConfig(newConfig);
    },
  }));

  // console.log('-----innerConfig', innerConfig);

  // eslint-disable-next-line no-extra-boolean-cast
  // @ts-ignore
  if (innerConfig['formFill']) {
    return (
      // @ts-ignore
      <FormModal {...innerConfig} open={open} onClose={onClose}>
        {innerConfig.content}
      </FormModal>
    );
  }

  return (
    <NiceModal {...innerConfig} open={open} onClose={onClose}>
      {innerConfig.content}
    </NiceModal>
  );
};

export default React.memo(React.forwardRef(HookModal));
