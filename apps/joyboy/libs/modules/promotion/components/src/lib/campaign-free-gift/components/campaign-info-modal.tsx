import { Modal, Sheet, Typography, Button, Box, Stack, buttonClasses } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';

interface PromptModalProps {
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  open: boolean;
  onClose: () => void;
}
export const CampaignInfoModal = ({
  title,
  description,
  cancelText = 'Okay',
  confirmText,
  onConfirm,
  open,
  onClose,
}: PromptModalProps) => {
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      disableEscapeKeyDown
      hideBackdrop={false}
      open={open}
      onClose={(event, reason) => {
        // 只有当关闭原因不是点击背景时才调用 onClose
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      slotProps={{
        backdrop: {
          onClick: (event) => {
            console.log('backdrop click');
            event.stopPropagation();
            event.preventDefault();
          },
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        '&:focus-visible': { outline: 'none' },
        [`& .${buttonClasses.root}`]: {
          padding: '12px 16px',
        },
      }}
    >
      <Sheet
        // variant="outlined"
        sx={{
          maxWidth: 420,
          px: 2,
          py: 3,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
          }}
        >
          <Close sx={{ width: 24, height: 24, fill: '#C1AF86' }} />
        </Box>
        {/* 目前 title 没有 24px 的level ,所以看起来样式有区别*/}
        <Box sx={{ width: '100%', py: 2, mb: 1 }}>
          <Typography
            id="modal-title"
            level="h3"
            textAlign="center"
            sx={{
              fontSize: 24,
            }}
          >
            {title}
          </Typography>

          <Typography
            id="modal-desc"
            level="caption1"
            sx={{
              textAlign: 'center',
              color: 'text.primary',
              mt: 1,
              width: '100%',
            }}
          >
            {description}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} width="100%">
          <Button
            variant="secondary"
            color="neutral"
            fullWidth
            onClick={onClose}
            sx={{
              py: 1.5,
              color: '#877445',
              textAlign: 'center',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '175%',
            }}
          >
            {cancelText}
          </Button>
          <Button
            variant="solid"
            color="primary"
            fullWidth
            onClick={onConfirm || onClose}
            sx={{
              py: 1.5,
              textAlign: 'center',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '175%',
            }}
          >
            {confirmText}
          </Button>
        </Stack>
      </Sheet>
    </Modal>
  );
};

export default CampaignInfoModal;
