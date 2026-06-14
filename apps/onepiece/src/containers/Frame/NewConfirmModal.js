import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const ConfirmModal = (
  {
    type,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    titleClassStr = '',
    iconSize = '',
    align = 'left',
    titleStyle = {},
    descriptionStyle = {},
    showCencelButton = true,
    showCloseButton = true,
  },
  { frame }
) => {
  const { desktop } = useBreakpoints();
  const cancel = () => {
    frame.removeModal();
    if (onCancel) {
      onCancel();
    }
  };

  const confirm = () => {
    frame.removeModal();
    if (onConfirm) {
      onConfirm();
    }
  };

  const iconStyle = useMemo(() => {
    const xsStyle = {
      width: '24px',
      height: '24px',
      marginRight: '8px',
    };
    const smallStyle = {
      width: '40px',
      height: '32px',
      marginRight: '16px',
    };
    const mediumStyle = {
      width: '48px',
      height: '48px',
    };

    const largeStyle = {
      width: '82px',
      height: '82px',
    };

    const iconSizeMap = {
      xs: xsStyle,
      small: smallStyle,
      medium: mediumStyle,
      large: largeStyle,
    };
    const size = desktop ? 'small' : 'xs';
    return iconSizeMap[iconSize || size];
  }, [desktop, iconSize]);

  const alignStyle = useMemo(() => {
    const leftStyle = {
      justifyContent: 'center',
      // textAlign: 'left',
    };
    const centerStyle = {
      justifyContent: 'center',
      textAlign: 'center',
    };

    const rightStyle = {
      justifyContent: 'flex-end',
      testAlign: 'right',
    };

    const alignStyleMap = {
      left: leftStyle,
      center: centerStyle,
      right: rightStyle,
    };
    return alignStyleMap[align];
  }, [align]);

  return (
    <div
      className={style.confirmModal}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className={`${style.confirmModal}__container`}>
        <div className={`${style.confirmModal}__content`}>
          <div
            className={`${style.confirmModal}__title ${style.confirmModal}__${titleClassStr}`}
            style={{
              ...alignStyle,
              ...titleStyle,
            }}
          >
            <div
              style={
                {
                  // alignSelf: 'flex-start',
                }
              }
            >
              <ReactSVG name={type} style={iconStyle} />
            </div>
            <div>{title}</div>
          </div>
          <div
            className={`${style.confirmModal}__description`}
            style={{
              ...alignStyle,
              ...descriptionStyle,
            }}
          >
            {description}
          </div>

          {showCloseButton && (
            <button type="button" className={`${style.confirmModal}__close`} onClick={() => frame.removeModal()}>
              <ReactSVG name="close" />
            </button>
          )}
        </div>
        <div className={`${style.confirmModal}__buttons`}>
          {showCencelButton && (
            <button type="button" onClick={cancel}>
              {cancelText}
            </button>
          )}
          <button type="button" onClick={confirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.animation = 'plain';

ConfirmModal.propTypes = {
  type: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.node,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  titleClassStr: PropTypes.string,
  iconSize: PropTypes.string,
  align: PropTypes.string,
  titleStyle: PropTypes.object,
  descriptionStyle: PropTypes.object,
  showCencelButton: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};
ConfirmModal.defaultProps = {
  type: 'warning',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

ConfirmModal.contextTypes = {
  frame: PropTypes.object,
};
export default ConfirmModal;
