import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactSVG from 'components/ReactSVG';
import Logo from 'components/Logo';
import { GhostArrowBtn } from 'components/Button';
import style from './style.scss';

export default class DiscountModal extends Component {
  static animation = 'plain';

  static contextTypes = {
    frame: PropTypes.object,
    router: PropTypes.object,
  };

  static propTypes = {
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
  };

  shop = () => {
    this.context.frame.removeModal();
    this.context.router.push('/');
  };

  render() {
    const { title, desc } = this.props;
    return (
      <div
        className={style.discount}
        onClick={(e) => {
          if (e.target.classList.contains(style.discount)) {
            this.context.frame.removeModal();
          }
        }}
      >
        <div className={`${style.discount}__body`}>
          <div className={`${style.discount}__logo`}>
            <Logo />
          </div>
          <div className={`${style.discount}__message`}>
            <h3>{title}</h3>
            <p>{desc}</p>
            <GhostArrowBtn text="Shop Now" onClick={this.shop} size="medium" style={{ marginTop: '10px' }} />
          </div>
          <button
            type="button"
            className={`btn ${style.discount}__close`}
            onClick={() => this.context.frame.removeModal()}
          >
            <ReactSVG name="close" />
          </button>
        </div>
      </div>
    );
  }
}
