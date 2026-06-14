import React from 'react';
import NiceModal, { type NiceModalProps } from './BaseModal';
import FormModal, { type TFormProps } from './FormModal';

/**
 * Type value that can be used when calling imperatively
 * eg: modal.information({...modalProps})
 */
export type ModalType = 'success' | 'information' | 'warning' | 'danger' | 'formFill';
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

  return (
    <React.Fragment>
      {innerConfig.formFill ? (
        <FormModal {...innerConfig} open={open} onClose={onClose}>
          {innerConfig.content}
        </FormModal>
      ) : (
        <NiceModal {...innerConfig} open={open} onClose={onClose}>
          {innerConfig.content}
        </NiceModal>
      )}
    </React.Fragment>
  );
};

export default React.memo(React.forwardRef(HookModal));
