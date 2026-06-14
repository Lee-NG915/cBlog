import React from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { connect } from 'react-redux';
import { hide } from 'redux/modules/fixBar';
import { isOutdated } from 'utils/time';
import { withUseBreakpoints } from 'utils/page';
import Input from './Input';
import style from './style.scss';

@connect(null, { hide })
@withUseBreakpoints
export default class PopupBar extends React.Component {
  static propTypes = {
    hide: PropTypes.func,
    breakpoints: PropTypes.object,
  };

  state = {
    location: 'form', // form or success
  };

  onSuccess() {
    const { hide } = this.props;
    this.setState({
      location: 'success',
    });

    setTimeout(() => hide(365), 1200);
  }

  render() {
    const { location } = this.state;
    const { hide, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (location === 'form') {
      const content = !isOutdated('2020-05-18', '2020-06-01') && {
        title: `Subscribe to our newsletter!`,
        desc: `Receive all our latest deals, events and more`,
      };
      return (
        <div className={style.popup}>
          {desktop && <ReactSVG name="usp-3" />}
          {!desktop ? (
            <div className={`${style.popup}__info`}>
              <p>{content.title}</p>
              <p>{content.desc}</p>
            </div>
          ) : (
            <div className={`${style.popup}__info`}>
              <p>{content.title}</p>
              <p>{content.desc}</p>
            </div>
          )}
          <div className={`${style.popup}__btns`}>
            <Input type="AU_FIXED_BAR" className={`${style.popup}__input`} onSuccess={() => this.onSuccess()} />
            <button type="button" onClick={() => hide()} className="btn">
              No. I don't like offers.
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className={style.popupSuccess}>
        <ReactSVG name="check-circle" />
        <p>You have successfully subscribed to the newsletter.</p>
      </div>
    );
  }
}
