import React from 'react';
import PropTypes from 'prop-types';
import style from './style.scss';

const ConfirmModal = ({ content, onConfirm, onCancel }, { frame }) => {
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

  return (
    <div className={style.confirm}>
      <div className={`${style.confirm}__container`}>
        <div className={`${style.confirm}__content`}>
          {content}
          <div className={`${style.confirm}__btns`}>
            <button type="button" className="btn" onClick={cancel}>
              Cancel
            </button>
            <button type="button" className="btn" onClick={confirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.animation = 'plain';

ConfirmModal.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  content: PropTypes.element,
};

ConfirmModal.contextTypes = {
  frame: PropTypes.object,
};
export default ConfirmModal;
