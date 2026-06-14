import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { renderImage } from 'utils/image';
import { set as setCookie } from 'helpers/Cookie';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@withUseBreakpoints
export default class FreeSwatchesModal extends Component {
  static propTypes = {
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  record = () => {
    setCookie('free_swatches_hidden', JSON.stringify(true), 7);
  };

  close = () => {
    const { frame } = this.context;
    frame.removeModal();
    this.record();
  };

  openSwatchModal = () => {
    const { frame } = this.context;
    frame.removeModal();
    setTimeout(() => {
      frame.openModal('swatch', this.props);
    }, 0);
  };

  render() {
    const closeBtn = (
      <button type="button" className={classNames('btn', `${style.swatches}__close`)} onClick={this.close}>
        <ReactSVG name="close" />
      </button>
    );
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;

    return (
      <div
        role="menuitem"
        className={style.swatches}
        onClick={(e) => {
          if (e.target.classList.contains(style.swatches)) {
            this.close();
          }
        }}
      >
        <div className={`${style.swatches}__wrapper`}>
          <div className={`${style.swatches}__container`}>
            <div className={`${style.swatches}__banner`}>
              {desktop
                ? renderImage('static/fabric-swatch/fabric_swatch_desktop.jpg', 0.9625, 0.25, { alt: 'Free Swatches' })
                : renderImage('static/fabric-swatch/fabric_swatch_mobile.jpg', 0.615, 0.25, { alt: 'Free Swatches' })}
            </div>
            <div className={`${style.swatches}__content`}>
              <div className={`${style.swatches}__title`}>Feeling {desktop ? <br /> : ''} is believing</div>
              <div className={`${style.swatches}__desc`}>We’ll send you swatches, for free.</div>
              <div className={`${style.swatches}__footer`}>
                <div role="button" className={`${style.swatches}__action`} onClick={this.openSwatchModal}>
                  Get Free Swatches
                </div>
              </div>
            </div>
          </div>
          {closeBtn}
        </div>
      </div>
    );
  }
}
