// 导出我们自定义的Modal组件
export { Modal, ModalOverflow, ModalClose, MModalClose } from './Modal';

// 导出 ModalClose 相关的其他变量
export { modalCloseClasses } from '@mui/joy/ModalClose';
export type { ModalCloseProps } from '@mui/joy/ModalClose';

// 导出其他 Joy UI 组件
export { default as ModalDialog } from '@mui/joy/ModalDialog';
export { modalDialogClasses } from '@mui/joy/ModalDialog';
export * from '@mui/joy/ModalDialog';

export { default as DialogTitle } from '@mui/joy/DialogTitle';
export * from '@mui/joy/DialogTitle';

export { default as DialogContent } from '@mui/joy/DialogContent';
export * from '@mui/joy/DialogContent';

export { default as DialogActions } from '@mui/joy/DialogActions';
export * from '@mui/joy/DialogActions';

// 导出原始Modal的类型和其他exports（除了组件本身）
export type { ModalProps } from '@mui/joy/Modal';
