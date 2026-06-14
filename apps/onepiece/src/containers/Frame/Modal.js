import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

export default class Modal extends Component {
  static animation = 'plain';

  static propTypes = {
    content: PropTypes.element,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  render() {
    const { content } = this.props;
    const { frame } = this.context;
    const closeBtn = (
      <button type="button" className={classNames('btn', `${style.modal}__close`)} onClick={() => frame.removeModal()}>
        <ReactSVG name="close" />
      </button>
    );

    return (
      <div
        role="menuitem"
        className={style.modal}
        onClick={(e) => {
          if (e.target.classList.contains(style.modal)) {
            frame.removeModal();
          }
        }}
      >
        <div className={`${style.modal}__container`}>
          <div className="window">
            {content}
            {closeBtn}
          </div>
        </div>
      </div>
    );
  }
}
