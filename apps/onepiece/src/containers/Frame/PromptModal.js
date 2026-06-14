import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { Button } from 'components/Button';
import style from './style.scss';

export default class AddressModal extends Component {
  static animation = 'plain';

  static propTypes = {
    onContinue: PropTypes.object.isRequired,
    onAbort: PropTypes.object.isRequired,
    title: PropTypes.string,
    body: PropTypes.string,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    isContainerShown: false,
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        isContainerShown: true,
      });
    }, 0);
  }

  render() {
    const closeBtn = (
      <button
        type="button"
        className={classNames('btn', `${style.prompt}__close`)}
        onClick={() => this.context.frame.removeModal()}
      >
        <ReactSVG name="close" />
      </button>
    );

    const { onContinue, onAbort, title, body } = this.props;

    return (
      <div
        className={classNames(`${style.prompt}`, {
          'is-shown': this.state.isContainerShown,
        })}
        onClick={(e) => {
          if (e.target.classList.contains(style.prompt)) {
            this.context.frame.removeModal();
          }
        }}
      >
        <div
          className={classNames(`${style.prompt}__container`, {
            'is-shown': this.state.isContainerShown,
          })}
        >
          {title && (
            <div className={`${style.prompt}__header`}>
              <div className={`${style.prompt}__title`}>{title}</div>
            </div>
          )}
          {body && <div className={`${style.prompt}__body`} dangerouslySetInnerHTML={{ __html: body }} />}
          <div className={`${style.prompt}__footer`}>
            {/* <button
              className={`${style.prompt}__abort btn btn-primary btn-small`}
              onClick={() => {
                this.context.frame.removeModal().then(onAbort.action);
              }}
            >
              {onAbort.text}
            </button> */}
            <Button
              text={onAbort.text}
              size="small"
              onClick={() => {
                this.context.frame.removeModal().then(onAbort.action);
              }}
            />
            {/* <button
              className={`${style.prompt}__continue btn btn-green btn-small`}
              onClick={onContinue.action}
            >
              {onContinue.text}
            </button> */}
            <Button text={onContinue.text} size="small" onClick={onContinue.action} style={{ marginLeft: '20px' }} />
          </div>
          {closeBtn}
        </div>
      </div>
    );
  }
}
