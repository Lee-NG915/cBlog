import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';

import style from './style.scss';

export default class MobileModal extends Component {
  static animation = 'bottomUpFade';

  static propTypes = {
    head: PropTypes.element,
    content: PropTypes.element,
    styleOverflow: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    closeSVG: PropTypes.node,
    closeHandler: PropTypes.func,
    closeDataSelenium: PropTypes.string,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  close = (e) => {
    const { frame } = this.context;
    const { closeHandler } = this.props;
    if (e.target === e.currentTarget) {
      frame.removeModal();
      if (closeHandler) {
        closeHandler();
      }
    }
  };

  render() {
    const { frame } = this.context;
    const { head, content, styleOverflow = false, closeSVG, closeHandler, closeDataSelenium } = this.props;
    const closeBtn = (
      <button
        type="button"
        className={classNames('btn', `${style.mobileModal}__close`)}
        onClick={() => {
          frame.removeModal();
          if (closeHandler) {
            closeHandler();
          }
        }}
        data-selenium={closeDataSelenium}
      >
        {closeSVG || <ReactSVG name="close" />}
      </button>
    );

    return (
      <div
        role="menuitem"
        className={style.mobileModal}
        onClick={this.close}
        style={{
          overflow: typeof styleOverflow === 'string' ? styleOverflow : styleOverflow ? 'auto' : 'inherit',
        }}
      >
        <div className={`${style.mobileModal}__container`}>
          {head && (
            <div className={`${style.mobileModal}__head__wrapper`}>
              <div className={`${style.mobileModal}__head`}>{head}</div>
            </div>
          )}
          {content}
          {closeBtn}
        </div>
      </div>
    );
  }
}
