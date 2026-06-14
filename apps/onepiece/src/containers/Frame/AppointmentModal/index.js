import React, { Component } from 'react';
import ReactSVG from 'components/ReactSVG';
import PropTypes from 'prop-types';
import { withNamedSelectContext } from 'utils/contextUtils';
import { withUseBreakpoints } from 'utils/page';
import Appointment from './Appointment';
import { FrameContext } from '../FrameContext';
import style from './style.scss';

@withUseBreakpoints
@withNamedSelectContext(FrameContext, 'frame')
export default class AppointmentModal extends Component {
  static animation = 'plain';

  static propTypes = {
    frame: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  // static contextTypes = {
  //   frame: PropTypes.object,
  // };

  closeHandler = (e) => {
    const { frame, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop && e.target.classList.contains(style.modal)) {
      frame.removeModal();
    }
  };

  render() {
    const { frame, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;

    return (
      <div role="menuitem" onClick={this.closeHandler} className={style.modal}>
        <div className={`${style.modal}__container`}>
          <Appointment onSuccess={() => frame.removeModal()} {...this.props} />
          {!desktop && (
            <button type="button" className={`${style.modal}__close btn`} onClick={() => frame.removeModal()}>
              <ReactSVG name="close" />
            </button>
          )}
        </div>
      </div>
    );
  }
}
