import React from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

const AfterpayModal = (props, { frame }) => {
  const handleClose = () => {
    frame.removeModal();
  };

  return (
    <div
      role="menuitem"
      className={style.afterpay}
      onClick={(e) => {
        if (e.target.classList.contains(style.afterpay)) {
          frame.removeModal();
        }
      }}
    >
      <div className={`${style.afterpay}__container`}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src="https://static.afterpay.com/modal/en_AU.html"
          title="Afterpay"
          className={`${style.afterpay}__iframe`}
        />

        <button type="button" className={`btn ${style.afterpay}__close`} onClick={handleClose}>
          <ReactSVG name="close" />
        </button>
      </div>
    </div>
  );
};

AfterpayModal.animation = 'plain';

AfterpayModal.contextTypes = {
  frame: PropTypes.object,
};

export default AfterpayModal;
