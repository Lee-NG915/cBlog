import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

export default class TextModal extends Component {
  static animation = 'plain';

  static propTypes = {
    content: PropTypes.element,
    showClose: PropTypes.bool,
    containerStyle: PropTypes.object,
    dismiss: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  close = (e) => {
    const { frame } = this.context;
    const { dismiss = frame.removeModal } = this.props;
    if (e.target.classList.contains(style.textModal)) {
      dismiss();
    }
  };

  render() {
    const { content, showClose, containerStyle } = this.props;
    const { frame } = this.context;
    return (
      <div role="menuitem" className={style.textModal} onClick={this.close}>
        <div className={`${style.textModal}__container`} style={containerStyle}>
          {content}
          {showClose && (
            <button
              type="button"
              className={classNames('btn', `${style.textModal}__close`)}
              onClick={() => frame.removeModal()}
            >
              <ReactSVG name="close" />
            </button>
          )}
        </div>
      </div>
    );
  }
}
