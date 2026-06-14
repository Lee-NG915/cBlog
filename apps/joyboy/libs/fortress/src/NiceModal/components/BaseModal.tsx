'use client';
/**
 * modal 基于 mui/joy
 * docs : https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
 */
import React, { useState } from 'react';
import { Box, Button } from '../../';
import useBreakpoints from '../../hooks/useBreakpoints';
import { Modal, ModalClose, ModalDialog, modalDialogClasses, ModalOverflow } from '../../Modal';
import { Desc, ModalActions, Title, type ActionHolderRef } from './Fragments';

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
  showCloseBtn?: boolean;
  /**
   * Use role="alertdialog" to create an alert dialog that interrupts the user's workflow.
   * @default dialog
   */
  modalRole?: 'dialog' | 'alertdialog';
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
   * Modal type : success / warning / info / danger
   * Display different prompt icons according to modal type
   */
  success?: boolean;
  warning?: boolean;
  info?: boolean;
  danger?: boolean;
  showDefaultFooter?: boolean;
  confirmation?: boolean;
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
  onConfirm?: () => Promise<any> | any;
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
  beforeClose?: (
    event: React.MouseEvent<HTMLButtonElement>,
    reason: 'escapeKeyDown' | 'backdropClick' | 'closeClick' | 'cancelClick' | 'confirmClick'
  ) => void;
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
  dialogSx?: Record<string, any>;
  fullScreen?: boolean;
  /**
   * Whether to close the modal by clicking the mask layer
   */
  disabledCloseByClickBackdrop?: boolean;
  /**
   * Whether to display the mask layer
   * @default null
   */
  container?: any;
  /**
   * slotProps
   * @default null
   */
  modalSlotProps?: any;
}
/**
 *
 * @param {NiceModalProps} props
 * @returns Modal
 */
const NiceModal = ({
  open,
  showCloseBtn = true,
  title,
  desc,
  subDesc,
  children,
  onClose,
  success = false,
  warning = false,
  danger = false,
  info = false,
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
  dialogSx = {},
  fullScreen = false,
  confirmation = false,
  disabledCloseByClickBackdrop = false,
  container,
  modalSlotProps,
}: NiceModalProps) => {
  const { mobile } = useBreakpoints();
  const actionRef = React.useRef<ActionHolderRef>(null);
  const [loading, setLoading] = useState(false);

  const mergeOnClose = (event: any, reason: 'escapeKeyDown' | 'backdropClick' | 'closeClick') => {
    if (disabledCloseByClickBackdrop && reason === 'backdropClick') return;
    if (typeof beforeClose === 'function') {
      beforeClose(event, reason);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={mergeOnClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted={keepMounted}
      disableEnforceFocus={disableEnforceFocus}
      disableAutoFocus={disableAutoFocus}
      disablePortal={disablePortal}
      hideBackdrop={hideBackdrop}
      ref={modalRef}
      container={container}
      slotProps={modalSlotProps}
    >
      <ModalOverflow>
        <ModalDialog
          role={modalRole}
          layout={fullScreen ? 'fullscreen' : 'center'}
          sx={{
            width: fullScreen ? 'auto' : 640,
            maxWidth: fullScreen ? 'auto' : '95vw' /** 358/375 => mobile */,
            ...dialogSx,
          }}
        >
          {showCloseBtn && <ModalClose />}

          <Box sx={{ width: '95%', display: 'flex', justifyContent: 'center' }}>
            <Title
              title={title}
              success={success}
              danger={danger}
              warning={warning}
              info={info}
              mobile={mobile}
              confirmation={confirmation}
            />
          </Box>
          <Desc desc={desc} subDesc={subDesc} />
          <Box className={`${modalDialogClasses.root}-content-children`}>{children}</Box>

          {showDefaultFooter ? (
            <ModalActions
              beforeClose={beforeClose}
              onClose={onClose}
              onCancel={onCancel}
              onConfirm={onConfirm}
              disabledCloseByClickBackdrop={disabledCloseByClickBackdrop}
              isSilent={isSilent}
              ref={actionRef}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: mobile ? 'column-reverse' : 'row',
                  gap: mobile ? 2 : 3,
                  width: '100%',
                }}
              >
                {showCancelBtn && (
                  <Button
                    variant="secondary"
                    sx={{ flex: 1, width: '100%' }}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      actionRef?.current?.handleCancel(e);
                    }}
                  >
                    {cancelText}
                  </Button>
                )}
                {showConfirmBtn && (
                  <Button
                    sx={{ flex: 1, width: '100%' }}
                    loading={loading}
                    onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                      if (actionRef?.current?.handleConfirm) {
                        setLoading(true);
                        await actionRef.current.handleConfirm(e);
                        setLoading(false);
                      }
                    }}
                  >
                    {confirmText}
                  </Button>
                )}
              </Box>
            </ModalActions>
          ) : null}
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
};

export default NiceModal;
