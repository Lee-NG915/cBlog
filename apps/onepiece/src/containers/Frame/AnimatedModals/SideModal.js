import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { CSSTransition } from 'react-transition-group';
import { withNamedSelectContext } from 'utils/contextUtils';
import classNames from 'classnames';
import { FrameContext } from '../FrameContext';
import ModalWrapper from '../ModalWrapper';

import style from './style.scss';

@withNamedSelectContext(FrameContext, 'frame')
export default class SideModal extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    position: PropTypes.string, // 'left' or 'right'
    showMask: PropTypes.bool,
    maxWidth: PropTypes.number,
    dismiss: PropTypes.func,
    frame: PropTypes.object,
  };

  static defaultProps = {
    position: 'left',
  };

  state = {
    isEntered: false,
  };

  constructor(props) {
    super(props);

    const { children } = this.props;

    invariant(children === null || React.Children.count(children) === 1, 'OpenModal can only pass one child');
  }

  render() {
    const { children, position, showMask = true, dismiss, maxWidth, frame, ...rest } = this.props;
    const { isEntered } = this.state;

    return (
      <CSSTransition
        {...rest}
        classNames="is"
        timeout={{ enter: 200, exit: 200 }}
        onEntered={() => {
          this.setState({
            isEntered: true,
          });
        }}
      >
        <ModalWrapper className={style.side} isEntered={isEntered}>
          <div
            role="menuitem"
            onClick={dismiss || (() => frame.removeModal())}
            className={classNames(`${style.side}__mask`, {
              'is-hide': !showMask,
            })}
          >
            {' '}
          </div>

          <div
            className={`${style.side}__container ${style.side}__container--${position}`}
            style={maxWidth ? { maxWidth } : null}
          >
            {children}
          </div>
        </ModalWrapper>
      </CSSTransition>
    );
  }
}
