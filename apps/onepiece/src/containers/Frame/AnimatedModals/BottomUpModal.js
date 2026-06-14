import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { CSSTransition } from 'react-transition-group';
import ModalWrapper from '../ModalWrapper';

import style from './style.scss';

export default class BottomUpModal extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  state = {
    isEntered: false,
  };

  constructor(props) {
    super(props);
    const { children } = props;

    invariant(children === null || React.Children.count(children) === 1, 'OpenModal can only pass one child');
  }

  render() {
    const { children, ...rest } = this.props;
    const { isEntered } = this.state;

    return (
      <CSSTransition
        {...rest}
        classNames="is"
        timeout={{ enter: 400, exit: 400 }}
        onEntered={() =>
          this.setState({
            isEntered: true,
          })
        }
      >
        <ModalWrapper isEntered={isEntered}>
          <div className={style.bottomUp}>{children}</div>
        </ModalWrapper>
      </CSSTransition>
    );
  }
}
