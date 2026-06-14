/**
 * modal 基于 mui/joy
 * docs : https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
 */
import React from 'react';
import { Modal, ModalDialog } from 'fortress/Modal';
import { Box, Button, IconButton } from 'fortress';
import { Close } from 'fortress/Icons';
import { ModalActions, Title, Desc, type ActionHolderRef } from './Fragments';
import useBreakpoints from 'fortress/hooks/useBreakpoints';

export type EventAction = (
  event: React.MouseEvent<HTMLButtonElement>,
  reason: 'escapeKeyDown' | 'backdropClick' | 'closeClick' | 'cancelClick' | 'confirmClick'
) => void;
export interface NiceModalProps {
  /**
   * Control whether modal is displayed
   * @default false
   */
  open: boolean;
  /**
   * close the modal => align with joy/ui
   * @returns
   */
  onClose: () => void;
  /**
   * Use role="alertdialog" to create an alert dialog that interrupts the user's workflow.
   * @default dialog
   */
  modalRole?: 'dialog' | 'alertdialog';
  /**
   * whether to show modal's inner-border
   */
  border?: boolean;
  /**
   * @param {string} title - title of Modal,text or richText or ReactElement
   * @default test
   */
  title?: string | React.ReactElement;
  /**
   * desc of Modal ,text or richText or ReactElement
   */
  desc?: string | React.ReactElement;
  subDesc?: string | React.ReactElement;
  /**
   * Modal type : success / warning / information / danger
   * Display different prompt icons according to modal type
   */
  success?: boolean;
  warning?: boolean;
  information?: boolean;
  danger?: boolean;
  showDefaultFooter?: boolean;
  /**
   * Control whether the button is displayed
   * @default true
   */
  showCancelBtn?: boolean;
  showConfirmBtn?: boolean;
  /**
   * reset button text
   * @default Cancel
   */
  cancelText?: string;
  /**
   * @default Submit
   */
  confirmText?: string;
  /**
   * Cancel EventHandler
   * @returns
   */
  onCancel?: () => void;
  /**
   * Confirm EventHandler : showConfirmButton:true,required
   * @returns
   */
  onConfirm?: () => void;
  /**
   * The content of modal is unmounted when closed.
   * https://mui.com/material-ui/react-modal/#performance
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Function to be executed before closing
   * @returns
   */
  beforeClose?: EventAction;
  children?: React.ReactNode;
  /**
   * If true, the modal will not prevent focus from leaving the modal while open.
   * https://mui.com/joy-ui/api/modal/#Modal-prop-disableEnforceFocus
   */
  disableEnforceFocus?: boolean;
  /**
   * If true, the modal will not automatically shift focus to itself when it opens, and replace it to the last focused element when it closes.
   * https://mui.com/joy-ui/api/modal/#Modal-prop-disableAutoFocus
   */
  disableAutoFocus?: boolean;
  /**
   * Whether to display the mask layer
   * @default true
   */
  hideBackdrop?: boolean;
  modalRef?: any;
  /**
   * use to server-render
   * https://mui.com/joy-ui/react-modal/#server-side-modal
   * display a modal rendered on the server,you can disable the portal feature with the disablePortal prop
   * @default false
   */
  disablePortal?: boolean;
  /**
   * Whether to wait for confirm to be executed before closing the modal
   * @default true 默认执行完confirm函数后关闭弹窗
   */
  isSilent?: boolean;
}
/**
 *
 * @param {NiceModalProps} props
 * @returns Modal
 */
const NiceModal = ({
  open,
  border = true,
  title,
  desc,
  subDesc,
  children,
  onClose,
  success = false,
  warning = false,
  danger = false,
  information = false,
  modalRole = 'dialog',
  keepMounted = false,
  showDefaultFooter = true,
  showCancelBtn = true,
  showConfirmBtn = true,
  cancelText = 'Cancel',
  confirmText = 'Submit',
  onCancel,
  onConfirm,
  disableEnforceFocus = false,
  disableAutoFocus = false,
  hideBackdrop = false,
  modalRef = null,
  disablePortal = false,
  isSilent = true,
  beforeClose,
}: NiceModalProps) => {
  const { mobile } = useBreakpoints();
  const actionRef = React.useRef<ActionHolderRef>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted={keepMounted}
      disableEnforceFocus={disableEnforceFocus}
      disableAutoFocus={disableAutoFocus}
      disablePortal={disablePortal}
      hideBackdrop={hideBackdrop}
      ref={modalRef}
    >
      <ModalDialog
        role={modalRole}
        sx={{
          width: 571,
          maxWidth: '95vw' /** 358/375 => mobile */,
          background: 'white',
          padding: mobile ? 1.25 : 2,
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <IconButton
          variant="plain"
          color="neutral"
          sx={(theme) => ({
            position: 'absolute',
            right: theme.spacing(1.25),
            top: theme.spacing(1.25),
          })}
          onClick={onClose}
        >
          <Close fontSize="xl3" />
        </IconButton>

        <Box
          sx={{
            border: border ? '1px solid var(--fortress-palette-brand-wheat-500)' : 'none',
            padding: 3,
          }}
        >
          <Title title={title} success={success} danger={danger} warning={warning} information={information} />
          <Desc desc={desc} subDesc={subDesc} />
          <Box role="section">{children}</Box>
        </Box>
        {showDefaultFooter && (
          <ModalActions
            beforeClose={beforeClose}
            onClose={onClose}
            onCancel={onCancel}
            onConfirm={onConfirm}
            isSilent={isSilent}
            ref={actionRef}
          >
            {showCancelBtn && (
              <Button
                variant="secondary"
                sx={{ flex: 1 }}
                onClick={(e) => {
                  actionRef?.current?.handleCancel(e);
                }}
              >
                {cancelText}
              </Button>
            )}
            {showConfirmBtn && (
              <Button
                sx={{ flex: 1 }}
                onClick={(e) => {
                  actionRef?.current?.handleConfirm(e);
                }}
              >
                {confirmText}
              </Button>
            )}
          </ModalActions>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default NiceModal;
