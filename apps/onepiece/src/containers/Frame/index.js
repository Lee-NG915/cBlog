/**
 *
 * This is a high order container to deal with sidemenu and modals
 *
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import assign from 'lodash/assign';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import FixSidebar from 'components/Fixed/FixSidebar';
import FixReview from 'components/Fixed/FixReview';
import { animate } from 'utils/animate';
import { withUseBreakpoints } from 'utils/page';
import { enableHideGladly } from 'config';
import ModalState from './modalState';
import animatedModals from './AnimatedModals';
import { FrameContext } from './FrameContext';

import style from './style.scss';

@withUseBreakpoints
export default class Frame extends Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    children: PropTypes.node,
    dyData: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  static childContextTypes = {
    frame: PropTypes.object,
    router: PropTypes.object,
  };

  counter = 0;

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      modals: [],
      newModals: [],
      pathname: props.router.location.pathname,
    };
    this.frameContextValue = {
      addModal: this.addModal,
      removeModal: this.removeModal,
      removeAllModals: this.removeAllModals,
      openModal: this.openModal,
      isModalShown: this.isModalShown,
      scrollToTop: this.scrollToTop,
      // openMobileModal: this.openMobileModal,
    };
  }

  getChildContext() {
    const { router } = this.props;
    return {
      frame: this.frameContextValue,
      router,
    };
  }

  componentDidMount() {
    const { mounted } = this.state;
    if (!mounted) {
      this.setState({ mounted: true });
    }
  }

  shouldComponentUpdate(nextProps) {
    const { pathname } = this.state;
    if (pathname !== nextProps.router.location.pathname) {
      this.scrollToTop(false);
      this.setState({
        modals: [],
        pathname: nextProps.router.location.pathname,
      });
      ModalState?.clearState();
    }
    return true;
  }

  componentDidUpdate() {
    if (this.isModalShown() && !this.isLockBody) {
      this.isLockBody = true;
      this.disableScroll();
    } else if (!this.isModalShown() && this.isLockBody) {
      this.isLockBody = false;
      this.enableScroll();
    }
  }

  disableScroll = () => {
    const { body } = document;
    body.style.position = 'absolute';
    body.style.overflow = 'hidden';
    body.style.width = '100%';
    body.style.height = '100%';
  };

  enableScroll = () => {
    const { body } = document;
    body.style.position = '';
    body.style.overflow = '';
    body.style.width = '';
    body.style.height = '';
  };

  scrollToTop = (animation = true, top = 0) => {
    if (animation) {
      animate({
        from: document.scrollingElement.scrollTop,
        to: top,
        duration: 500,
        func: 'easeInOutCubic',
        callback: (d) => {
          document.scrollingElement.scrollTop = d;
        },
      });
    } else {
      document.scrollingElement.scrollTop = top;
    }
  };

  // add a custom modal, can apply animations
  addModal = (element, animation, options) => {
    const type = animation || 'plain';

    this.renderModal(animatedModals[type], {
      children: element,
      ...options,
    });
  };

  removeModal = (position = 1) => {
    const { modals } = this.state;

    // if position exceeds the number of modals, remove the first one
    let newPosition = position;
    if (position > modals.length) {
      newPosition = modals.length;
    }

    const target = modals.length - newPosition;

    const modalsCopy = modals.slice();
    modalsCopy.splice(target, 1);
    ModalState.removeState(target);
    return new Promise((resolve) => {
      this.setState(
        () => ({
          modals: modalsCopy,
        }),
        resolve
      );
    });
  };

  removeAllModals = () => {
    this.setState(() => ({
      modals: [],
    }));
    ModalState.clearState();
  };

  openModal = (name, param = {}, animationOptions = {}) => {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    import(/* webpackPrefetch: true, webpackChunkName: "modals" */ './modals').then((module) => {
      const { desktopModals, mobileModals } = module;
      const Modal = !desktop ? mobileModals[name] : desktopModals[name];
      ModalState.addState(name);
      if (Modal.animation !== 'custom') {
        this.addModal(<Modal {...param} />, Modal.animation, assign(Modal.animationOptions, animationOptions));
      } else {
        this.renderModal(Modal, param);
      }
    });
  };

  // openMobileModal = ({ content, head, foot, height = 80 }) => {
  //   const modalProps = {
  //     content,
  //     head,
  //     foot,
  //     height,
  //     open: true,
  //     close: () => {
  //       const { newModals } = this.state;
  //       const proxyMobileModals = newModals.slice(0);
  //       proxyMobileModals[proxyMobileModals.length - 1].open = false;
  //       this.setState({
  //         newModals: proxyMobileModals,
  //       });
  //     },
  //     clear: () => {
  //       const { newModals } = this.state;
  //       const proxyMobileModals = newModals.slice(0, -1);
  //       this.setState({
  //         newModals: proxyMobileModals,
  //       });
  //     },
  //   };
  //   this.setState((last) => {
  //     const lastMobileModals = last.newModals;
  //     return { newModals: [...lastMobileModals, modalProps] };
  //   });
  // };

  isModalShown = () => {
    const { modals, newModals } = this.state;
    return modals.length > 0 || newModals.length > 0;
  };

  renderModal = (modal, param) => {
    this.setState((lastState) => ({
      modals: [...lastState.modals, { id: (this.counter += 1), module: modal, options: param }],
    }));
  };

  render() {
    const { children, breakpoints = {}, router } = this.props;
    const isDisableGladly = enableHideGladly && router?.location?.pathname?.includes('/announcement');
    const { desktop } = breakpoints;
    const { modals, mounted, newModals } = this.state;

    return (
      <FrameContext.Provider value={this.frameContextValue}>
        <div
          className={classNames(style.frame, {
            'is-modal-open': modals.length > 0,
          })}
        >
          <div className={`${style.frame}__container`}>{children}</div>

          {!isDisableGladly ? <FixSidebar /> : null}

          {desktop && <FixReview />}

          {mounted &&
            ReactDOM.createPortal(
              <TransitionGroup ref={this.modal} component="div" className={`${style.frame}__modal`}>
                {modals.map((modal) => {
                  const Module = modal.module;
                  return <Module key={modal.id} {...modal.options} />;
                })}
              </TransitionGroup>,
              document.querySelector('#modal')
            )}

          {/* {mounted &&
            ReactDOM.createPortal(
              <div
                style={{
                  position: 'fixed',
                  width: '100%',
                  height: '100%',
                  top: '0',
                  zIndex: newModals.length ? 2 : -1,
                }}
              >
                <AnimatePresence>
                  {newModals.map((modal, index) => (
                    <NewMobileModal key={index} {...modal} />
                  ))}
                </AnimatePresence>
              </div>,
              document.querySelector('#mobileModal')
            )} */}
        </div>
      </FrameContext.Provider>
    );
  }
}
