import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import ReactSVG from 'components/ReactSVG';
import { CSSTransition } from 'react-transition-group';
import Bem from 'utils/bem';
import { withNamedSelectContext } from 'utils/contextUtils';
import { withUseBreakpoints } from 'utils/page';
import { FrameContext } from '../FrameContext';
import ModalWrapper from '../ModalWrapper';
import style from './style.scss';

@withNamedSelectContext(FrameContext, 'frame')
@withUseBreakpoints
export default class BottomUpFadeModal extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    dismiss: PropTypes.func,
    height: PropTypes.number,
    className: PropTypes.string,
    frame: PropTypes.object,
    fixedItem: PropTypes.element,
    fromNewPDP: PropTypes.bool,
    styleOverflow: PropTypes.string,
    showBtn: PropTypes.bool,
    contentBgColor: PropTypes.string,
    breakpoints: PropTypes.object,
  };

  static defaultProps = {
    height: 80,
    contentBgColor: 'none',
  };

  state = {
    isEntered: false,
  };

  constructor(props) {
    super(props);
    const { children } = props;

    invariant(children === null || React.Children.count(children) === 1, 'OpenModal can only pass one child');
  }

  clickHandler = (classNames) => (e) => {
    const { dismiss, frame } = this.props;
    if (e.target.classList.contains(classNames)) {
      if (dismiss && typeof dismiss === 'function') {
        dismiss();
      } else {
        frame.removeModal();
      }
    }
  };

  render() {
    const {
      dismiss,
      children,
      height,
      className,
      frame,
      fixedItem,
      fromNewPDP,
      styleOverflow,
      showBtn = true,
      contentBgColor,
      breakpoints = {},
      ...rest
    } = this.props;
    const { desktop } = breakpoints;
    const { isEntered } = this.state;

    const block = new Bem(style.bottomUpFade).mix(className);

    // const closeClick = this.clickHandler(block);

    const closeClickBg = this.clickHandler(block.elm('bg'));
    const stopTouchMove = (event) => {
      event.stopPropagation();
      event.preventDefault();
    };
    return (
      <>
        <CSSTransition
          {...rest}
          classNames="is"
          timeout={!desktop ? { enter: 350, exit: 350 } : { enter: 0, exit: 0 }}
          onEntered={() =>
            this.setState({
              isEntered: true,
            })
          }
        >
          <ModalWrapper
            isEntered={isEntered}
            className={block}
            onClick={(e) => {
              if (e.target.classList.contains(block)) {
                dismiss();
              }
            }}
          >
            <div role="menuitem" className={block.elm('bg')} onClick={closeClickBg} onTouchMove={stopTouchMove}>
              {' '}
            </div>
            <div
              className={block.elm('container')}
              style={
                !desktop
                  ? {
                      height: `${height}%`,
                      top: `${100 - height}%`,
                      overflow: styleOverflow || 'hidden',
                      backgroundColor: contentBgColor,
                    }
                  : {
                      backgroundColor: contentBgColor,
                    }
              }
            >
              {children}
              {dismiss && showBtn ? (
                fromNewPDP ? (
                  <button type="button" className={block.elm('newClose')} onClick={dismiss}>
                    <ReactSVG name="dismiss" />
                  </button>
                ) : (
                  <button type="button" className={block.elm('close')} onClick={dismiss}>
                    <ReactSVG name="close" />
                  </button>
                )
              ) : null}
            </div>
          </ModalWrapper>
        </CSSTransition>
        {fixedItem}
      </>
    );
  }
}
