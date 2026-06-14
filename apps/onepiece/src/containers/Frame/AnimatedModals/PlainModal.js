import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { Transition } from 'react-transition-group';
import ModalWrapper from '../ModalWrapper';

export default class PlainModal extends React.Component {
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
      <Transition
        {...rest}
        timeout={0}
        onEntered={() => {
          this.setState({
            isEntered: true,
          });
        }}
      >
        <ModalWrapper isEntered={isEntered}>{children}</ModalWrapper>
      </Transition>
    );
  }
}
