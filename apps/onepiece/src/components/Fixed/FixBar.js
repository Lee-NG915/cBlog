import React from 'react';
import PropTypes from 'prop-types';
import PopupBar from 'components/Subscription/PopupBar';
import ReactSVG from 'components/ReactSVG';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { load, hide } from 'redux/modules/fixBar';

import style from './style.scss';

@connect(
  (state) => ({
    hidden: state.fixBar.hidden,
  }),
  { load, hide }
)
export default class FixBar extends React.Component {
  static propTypes = {
    hidden: PropTypes.bool,
    load: PropTypes.func,
    hide: PropTypes.func,
  };

  state = {
    loaded: false,
  };

  componentDidMount() {
    if (!window.DYO) {
      const { load } = this.props;
      load();
      this.setState({
        loaded: true,
      });
    }
  }

  render() {
    const { hidden, hide } = this.props;
    const { loaded } = this.state;

    if (loaded) {
      return (
        <div
          className={classNames(style.bar, {
            'is-shown': !hidden,
          })}
        >
          <PopupBar />
          <button type="button" onClick={() => hide()} className="btn">
            <ReactSVG name="arrow-down" />
          </button>
        </div>
      );
    }
    return null;
  }
}
