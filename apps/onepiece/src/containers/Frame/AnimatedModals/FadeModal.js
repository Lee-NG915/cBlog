import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { CSSTransition } from 'react-transition-group';
import ModalWrapper from '../ModalWrapper';

import style from './style.scss';

export default class FadeModal extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    dismiss: PropTypes.func,
  };

  state = {
    isEntered: false,
  };

  constructor(props) {
    super(props);
    const { children } = props;

    invariant(children === null || React.Children.count(children) === 1, 'OpenModal can only pass one child');
  }

  // componentWillMount() {
  //   const { children } = this.props;

  //   invariant(
  //     children === null || React.Children.count(children) === 1,
  //     'OpenModal can only pass one child'
  //   );
  // }

  closeHandler = (e) => {
    const { dismiss } = this.props;
    if (e.target.classList.contains(style.fade) && dismiss) {
      dismiss();
    }
  };

  render() {
    const { children, dismiss, ...rest } = this.props;
    const { isEntered } = this.state;

    return (
      <CSSTransition
        {...rest}
        classNames="is"
        timeout={{ enter: 300, exit: 300 }}
        onEntered={() =>
          this.setState({
            isEntered: true,
          })
        }
      >
        <ModalWrapper className={style.fade} onClick={this.closeHandler} isEntered={isEntered}>
          <div className={`${style.fade}__container`}>{children}</div>
        </ModalWrapper>
      </CSSTransition>
    );
  }
}
