import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { Button } from 'components/Button';
import { FrameContext } from './FrameContext';

import style from './style.scss';

const ARErrorModal = ({ handleClose }) => {
  const frame = useContext(FrameContext);

  const handleBack = useCallback(() => {
    frame.removeModal();

    if (handleClose) {
      handleClose();
    }
  }, [frame, handleClose]);

  return (
    <div role="menuitem" className={style.arErrorModal}>
      <div className={`${style.arErrorModal}__container`}>
        <div>
          <ReactSVG name="ar-error" />

          <h2>Oh dear, we are unable to load AR on your phone</h2>

          <p>It is likely that your mobile device did not meet these requirements:</p>
          <p>
            <strong>iOS</strong> iPhone 7 and newer, iPad 5 and newer, running iOS 12+
          </p>
          <p>
            <strong>Android</strong> Devices with ARCore 1.9 support on Android 8+
          </p>
          <p>You may wish to update your software and try again.</p>

          <Button text="Back" className={`${style.arErrorModal}__back`} onClick={handleBack} />
        </div>
      </div>
    </div>
  );
};

ARErrorModal.propTypes = {
  handleClose: PropTypes.func,
};
ARErrorModal.animation = 'plain';

export default ARErrorModal;
