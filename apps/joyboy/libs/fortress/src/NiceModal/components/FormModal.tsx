import React from 'react';
import { Button, Box, HookForm, type FormProps } from '../../index';
import NiceModal, { type NiceModalProps } from './BaseModal';
import { ModalActions, type ActionHolderRef } from './Fragments';

type TFormValues = Record<string, any>;
export interface TFormProps extends Omit<FormProps, 'submit'> {
  /**
   * 覆盖FormProps 中的submit，因为设置async button状态，所以需要promise
   */
  asyncSubmit(data: TFormValues): Promise<void>;
}

const NiceFormModal: React.FC<NiceModalProps & TFormProps> = ({
  open,
  form,
  validators = {},
  defaultFetcher = {},
  asyncSubmit,
  formSxProps,
  showCancelBtn = true,
  showConfirmBtn = true,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  beforeClose,
  onClose,
  onCancel,
  onConfirm,
  isSilent = true,
  ...rest
}) => {
  const baseProps = { open, onClose, showDefaultFooter: false, ...rest };
  const [loading, setLoading] = React.useState<boolean>(false);
  const actionRef = React.useRef<ActionHolderRef>(null);

  const innerSubmit = async (data: TFormValues) => {
    setLoading(true);
    await asyncSubmit(data);
    setLoading(false);
    if (isSilent) {
      onClose();
    }
  };

  return (
    <NiceModal {...baseProps}>
      <HookForm
        form={form}
        validators={validators}
        defaultFetcher={defaultFetcher}
        submit={innerSubmit}
        formSxProps={formSxProps}
        autoFocus
      >
        <Box sx={{ position: 'relative', width: 'inherit' }}>
          <ModalActions
            sx={{
              // position: 'absolute',
              gap: 3,
              // left: (theme: any) => theme.spacing(-3),
              // right: (theme: any) => theme.spacing(-3),
            }}
            beforeClose={beforeClose}
            onClose={onClose}
            onCancel={onCancel}
            ref={actionRef}
            disabledCloseByClickBackdrop={false}
          >
            {showCancelBtn && (
              <Button
                variant="secondary"
                sx={{ flex: 1, ...(showConfirmBtn ? null : { borderRight: 'none' }) }}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  actionRef?.current?.handleCancel(event);
                }}
              >
                {cancelText}
              </Button>
            )}
            {showConfirmBtn && (
              <Button
                type="submit"
                loading={loading}
                sx={{ flex: 1, ...(showCancelBtn ? null : { borderLeft: 'none' }) }}
              >
                {confirmText}
              </Button>
            )}
          </ModalActions>
          <Box sx={{ height: 22 }}></Box>
        </Box>
      </HookForm>
    </NiceModal>
  );
};

export default NiceFormModal;
