import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import Address from 'components/Address';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const AddressModal = ({ onSubmit }, { frame }) => {
  const { desktop } = useBreakpoints();
  const handleSubmit = (data, mode) => {
    onSubmit(data, mode);
    frame.removeModal();
  };

  const closeBtn = (
    <button type="button" className={classNames('btn', `${style.address}__close`)} onClick={() => frame.removeModal()}>
      <ReactSVG name="close" />
    </button>
  );

  return (
    <div
      role="menuitem"
      className={style.address}
      onClick={(e) => {
        if (e.target.classList.contains(style.address)) {
          frame.removeModal();
        }
      }}
    >
      <div className={`${style.address}__container`}>
        <Address
          submitButton={{
            text: 'Save',
            onClick: handleSubmit,
          }}
          onSubmit={handleSubmit}
        />

        {!desktop && closeBtn}
      </div>
    </div>
  );
};

AddressModal.animation = 'plain';

AddressModal.propTypes = {
  onSubmit: PropTypes.func,
};

AddressModal.contextTypes = {
  frame: PropTypes.object,
};

export default AddressModal;
