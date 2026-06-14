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
