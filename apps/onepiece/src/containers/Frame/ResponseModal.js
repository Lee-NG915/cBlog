import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { ternaryExpressions } from 'utils/ternaryExpression';
import style from './style.scss';

export default class ResponseModal extends Component {
  static animation = 'plain';

  static propTypes = {
    status: PropTypes.string, // successful failed
    title: PropTypes.string,
    body: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    button: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  static defaultProps = {
    status: 'failed',
    title: 'Oops!',
    body: 'Something went wrong, please try again later',
    button: {
      text: 'Got it',
    },
  };

  state = {
    isContainerShown: false,
    isIconShown: false,
  };

  componentDidMount() {
    const { button } = this.props;
    const { frame } = this.context;
    setTimeout(() => {
      this.setState({
        isContainerShown: true,
      });
    }, 0);

    if (!button) {
      setTimeout(() => frame.removeModal(), 2500);
    }
  }

  render() {
    const { isContainerShown } = this.state;
    const { frame } = this.context;
    const { status, title, body, button } = this.props;

    return (
      <div
        className={classNames(`${style.response} ${style.response}--${status}`, {
          'is-shown': isContainerShown,
        })}
        onClick={(e) => {
          e.stopPropagation();
          if (e.target.classList.contains(style.response)) {
            frame.removeModal();
          }
        }}
      >
        <div
          className={classNames(`${style.response}__container`, {
            'is-shown': isContainerShown,
          })}
        >
          <div
            className={classNames(
              `${style.response}__icon`,
              { 'is-shown': isContainerShown },
              { success: status === 'successful' }
            )}
          >
            {status === 'successful' ? <ReactSVG name="check-circle" /> : <ReactSVG name="error-circle" />}
          </div>
          {title && <p className={`${style.response}__title`}>{title}</p>}
          {body ? (
            <p className={`${style.response}__body`}>
              {typeof body === 'string'
                ? body
                : body?.contentHtml
                ? body.contentHtml
                : ternaryExpressions(
                    body?.errors,
                    body?.errors?.[0]?.detail,
                    'Something went wrong, please try again later'
                  )}
            </p>
          ) : (
            <p className={`${style.response}__body`}>Something went wrong, please try again later</p>
          )}
          {button &&
            (button.link ? (
              <a className={`${style.response}__button btn`} href={button.link}>
                {button.text}
              </a>
            ) : (
              <a
                role="button"
                tabIndex="0"
                className={`${style.response}__button btn`}
                onClick={() => this.context.frame.removeModal()}
              >
                {button.text}
              </a>
            ))}
        </div>
      </div>
    );
  }
}
