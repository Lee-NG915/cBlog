import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CloseLeft, CloseRight } from '@castlery/fortress/Icons';
import SearchInput from './SearchInput';

import style from './style.scss';

export default class SearchBar extends Component {
  static propTypes = {
    className: PropTypes.string,
    isHidden: PropTypes.bool,
    onClose: PropTypes.func,
    forwardRef: PropTypes.object,
  };

  static contextTypes = {
    router: PropTypes.object,
    frame: PropTypes.object,
  };

  onClickSuggestion = () => {
    const { frame } = this.context;
    frame.removeModal();
  };

  onClose = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    } else {
      this.onClickSuggestion();
    }
  };

  render() {
    const { className, isHidden, forwardRef } = this.props;

    return (
      <div className={classNames(style.search, { 'is-hidden': isHidden }, className)} ref={forwardRef}>
        <SearchInput isHidden={isHidden} onClose={this.onClose} onClickSuggestion={this.onClickSuggestion} />
        <button type="button" className={`${style.search}__close btn`} onClick={this.onClose} aria-label="Close">
          <span className={`${style.search}__close__left`}>
            <CloseLeft />
          </span>
          <span className={`${style.search}__close__right`}>
            <CloseRight />
          </span>
        </button>
      </div>
    );
  }
}
