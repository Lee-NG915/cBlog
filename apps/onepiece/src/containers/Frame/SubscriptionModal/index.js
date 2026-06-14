import React from 'react';
import PropTypes from 'prop-types';
import Content from './Content';
import style from './style.scss';

export default class SubscriptionModal extends React.Component {
  static animation = 'plain';

  static contextTypes = {
    frame: PropTypes.object,
    onClose: PropTypes.func,
  };

  handleClose = () => {
    const { frame } = this.context;
    const { onClose } = this.props;
    frame.removeModal();
    if (onClose) {
      onClose();
    }
  };

  render() {
    return (
      <div
        onClick={(e) => {
          if (e.target.classList.contains(style.modal)) {
            this.handleClose();
          }
        }}
        className={style.modal}
      >
        <div className={`${style.modal}__container`}>
          <Content close={this.handleClose} {...this.props} />
        </div>
      </div>
    );
  }
}
