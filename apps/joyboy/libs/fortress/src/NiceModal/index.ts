import type { WithoutActionInnerConfig } from './components/HookModal';
import type { TFormProps } from './components/FormModal';
import type { NiceModalProps } from './components/BaseModal';

/**
 * Available components
 */
export { default as NiceModal } from './components/BaseModal';
export { default as NiceFormModal } from './components/FormModal';
/**
 * Available components
 */
export { useDecNiceModal } from './hooks/useDecNiceModal';
export { useNiceModal } from './hooks/useModal'; // Most recommended
/**
 * Available types
 */
export type { NiceModalProps } from './components/BaseModal';
export type ImpModalProps = WithoutActionInnerConfig;
export type NiceFormModalProps = NiceModalProps & TFormProps;

export type { HookAPI } from './hooks/useModal';
export { ElementsHolder, type ElementsHolderRef } from './hooks/elementsHolder';
export {
  default as HookModal,
  type HookModalRef,
  type WithoutActionInnerConfig,
  type ModalType,
} from './components/HookModal';
