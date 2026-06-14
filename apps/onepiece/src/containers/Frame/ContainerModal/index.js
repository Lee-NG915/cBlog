import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

export default class ContainerModal extends Component {
  static animation = 'plain';

  static propTypes = {
    component: PropTypes.element,
    className: PropTypes.string,
    hideCloseBtn: PropTypes.bool,
    type: PropTypes.string,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  closeModal = (e) => {
    const { frame } = this.context;
    if (e.target.classList.contains(style.container)) {
      frame.removeModal();
    }
  };

  render() {
    const { component, className, hideCloseBtn, type } = this.props;
    const { frame } = this.context;
    const closeBtn = (
      <button
        type="button"
        className={classNames('btn', `${style.container}__close`)}
        onClick={() => frame.removeModal()}
      >
        <ReactSVG name="close" />
      </button>
    );

    return (
      <div
        role="menuitem"
        className={classNames(style.container, className, {
          'is-chope': type === 'chope',
        })}
        onClick={this.closeModal}
      >
        <div className={`${style.container}__container`}>
          {component}
          {!hideCloseBtn && closeBtn}
        </div>
      </div>
    );
  }
}
