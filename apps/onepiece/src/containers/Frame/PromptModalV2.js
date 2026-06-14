import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Sheet, Typography, Button } from '@castlery/fortress';
import { Close } from 'fortress/Icons';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

const PromptModal = ({
  title,
  description,
  cancelText,
  confirmText,
  okText,
  onConfirm,
  onCancel,
  onOk,
  open,
  okBtnWidth,
}) => {
  // 判断是否显示双按钮
  const isDoubleButtons = cancelText && confirmText;
  const { desktop } = useBreakpoints();
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onCancel={onCancel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        '&:focus-visible': {
          outline: 'none',
        },
        '--fortress-fontFamily-display': 'Aime',
        '--fortress-palette-background-surface': '#F6F3E7',
      }}
    >
      <Sheet
        sx={{
          maxWidth: desktop ? 620 : 358,
          borderRadius: 'md',
          // p: 4,
          padding: desktop ? '24px 32px' : '24px 16px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          '&:focus-visible': {
            outline: 'none',
          },
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            cursor: 'pointer',
            color: '#C1AF86',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onCancel}
        >
          <Close
            style={{
              width: '24px',
              height: '24px',
              color: '#3C101E',
            }}
          />
        </div>

        <Typography component="h2" id="modal-title" textAlign="center" level="h3">
          {title}
        </Typography>

        <Typography
          id="modal-desc"
          level="body2"
          sx={{
            textAlign: 'center',
            color: 'var(--colours-text-primary, #323433)',
            marginTop: '8px',
            marginBottom: '24px',
            width: '100%',
            padding: desktop ? '0 32px' : '0 0',
          }}
        >
          {description}
        </Typography>

        {isDoubleButtons ? (
          // 双按钮布局
          <div
            style={{
              display: 'flex',
              gap: '16px',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant="secondary"
              color="neutral"
              sx={{
                flex: 1,
                py: 1.5,
                backgroundColor: 'transparent',
                borderWidth: '1px',
                height: '52px',
                minHeight: '52px',
                '--variant-outlinedHoverBg': '#63404B',
                '--variant-outlinedActiveBg': '#3C101E',
                '--variant-outlinedHoverColor': '#F6F3E7',
                '--variant-outlinedActiveColor': '#F6F3E7',
                '--variant-outlinedHoverBorder': '#3C101E',
                paddingBlock: '0.5rem',
                paddingInline: '1.5rem',
                margin: '0',
                textDecoration: 'none',
                borderColor: '#3C101E',
                transition: '0.2s ease-out',
                gap: '8px',
                borderRadius: '8px',
                padding: '12px 24px',
                color: '#3C101E',
              }}
              onClick={onCancel}
            >
              <Typography level="subh2">{cancelText}</Typography>
            </Button>
            <Button
              variant="solid"
              sx={{
                flex: 1,
                '--variant-solidColor': '#F6F3E7',
                '--variant-solidBg': '#D25C1B',
                '--variant-solidBorder': '#D25C1B',
                '--variant-solidHoverColor': '#F6F3E7',
                '--variant-solidHoverBg': '#BF5419',
                '--variant-solidHoverBorder': '#BF5419',
                '--variant-solidFocusColor': '#F6F3E7',
                '--variant-solidFocusBg': '#BF5419',
                '--variant-solidFocusBorder': '#BF5419',
                '--variant-solidActiveColor': '#F6F3E7',
                '--variant-solidActiveBg': '#74330F',
                '--variant-solidActiveBorder': '#74330F',
                '--variant-solidDisabledColor': '#9E9E9E',
                '--variant-solidDisabledBg': '#D2D2D2',
                '--variant-solidDisabledBorder': '#D2D2D2',
                color: '#F6F3E7',
                paddingBlock: '0.5rem',
                paddingInline: '1.5rem',
                margin: 'var(--Button-margin)',
                textDecoration: 'none',
                borderColor: '#D25C1B',
                transition: '0.2s ease-out',
                gap: '8px',
                borderRadius: '8px',
                padding: '12px 24px',
                minWidth: okBtnWidth,
              }}
              onClick={onConfirm}
            >
              <Typography level="subh2" sx={{ color: '#F6F3E7' }}>
                {confirmText}
              </Typography>
            </Button>
          </div>
        ) : (
          // 单按钮布局
          <Button
            variant="solid"
            sx={{
              width: '100%',
              '--variant-solidColor': '#F6F3E7',
              '--variant-solidBg': '#D25C1B',
              '--variant-solidBorder': '#D25C1B',
              '--variant-solidHoverColor': '#F6F3E7',
              '--variant-solidHoverBg': '#BF5419',
              '--variant-solidHoverBorder': '#BF5419',
              '--variant-solidFocusColor': '#F6F3E7',
              '--variant-solidFocusBg': '#BF5419',
              '--variant-solidFocusBorder': '#BF5419',
              '--variant-solidActiveColor': '#F6F3E7',
              '--variant-solidActiveBg': '#74330F',
              '--variant-solidActiveBorder': '#74330F',
              '--variant-solidDisabledColor': '#9E9E9E',
              '--variant-solidDisabledBg': '#D2D2D2',
              '--variant-solidDisabledBorder': '#D2D2D2',
              paddingBlock: '0.5rem',
              paddingInline: '1.5rem',
              margin: 'var(--Button-margin)',
              textDecoration: 'none',
              borderColor: 'var(--variant-solidBorder, var(--fortress-palette-primary-solidBorder, #844025))',
              transition: '0.2s ease-out',
              gap: '8px',
              borderRadius: '8px',
              padding: '12px 24px',
              // fontFamily: 'SanomatSans',
              // textTransform: 'uppercase',
              // letterSpacing: '0.2em',
              flex: '0 auto',
              minWidth: 0,
            }}
            onClick={onOk || onCancel}
          >
            <Typography level="subh2">{okText}</Typography>
          </Button>
        )}
      </Sheet>
    </Modal>
  );
};

PromptModal.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  okText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  open: PropTypes.bool,
  okBtnWidth: PropTypes.string,
};

PromptModal.defaultProps = {
  okText: 'Okay',
};

export default PromptModal;
