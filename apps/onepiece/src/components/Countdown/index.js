import React from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import { getDate, getDuration } from 'utils/time';

import style from './style.scss';

const TIME_UNITS = [
  {
    key: 'days',
    shortName: 'D',
    longName: 'Days',
  },
  {
    key: 'hours',
    shortName: 'H',
    longName: 'Hours',
  },
  {
    key: 'mins',
    shortName: 'M',
    longName: 'Mins',
  },
  {
    key: 'secs',
    shortName: 'S',
    longName: 'Secs',
  },
];

export default class Countdown extends React.PureComponent {
  static propTypes = {
    deadline: PropTypes.string.isRequired,
    className: PropTypes.string,
    collapsed: PropTypes.bool,
    customStyle: PropTypes.object,
  };

  state = {
    time: {
      days: '00',
      hours: '00',
      mins: '00',
      secs: '00',
    },
    isTimeout: true,
  };

  componentDidMount() {
    this.setTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  setTimer() {
    const { deadline } = this.props;
    this.timer = setInterval(() => {
      const now = getDate();
      const end = getDate(deadline, __TIME_ZONE__, true);
      const diff = end.diff(now);
      if (diff > 0) {
        const duration = getDuration(diff);
        this.setState({
          time: {
            days: Math.floor(duration.asDays()),
            hours: duration.hours(),
            mins: duration.minutes(),
            secs: duration.seconds(),
          },
          isTimeout: false,
        });
      } else {
        this.setState({
          isTimeout: true,
        });
        this.clearTimer();
      }
    }, 1000);
  }

  clearTimer() {
    clearInterval(this.timer);
  }

  showTimeUnit(key) {
    // show secs only when less than one day
    const {
      time: { days, hours, mins },
    } = this.state;
    if (days > 0) {
      return key !== 'secs';
    }
    if (hours > 0) {
      return key !== 'days';
    }
    if (mins > 0) {
      return key !== 'days' && key !== 'hours';
    }
    return key === 'secs';
  }

  render() {
    const { collapsed, className, customStyle } = this.props;
    const { time, isTimeout } = this.state;
    const block = new Bem(style.countdown).mix(className);

    if (isTimeout) {
      return null;
    }
    return !customStyle ? (
      collapsed ? (
        <div className={block.mod('collapsed')}>
          {TIME_UNITS.map((timeUnit) =>
            this.showTimeUnit(timeUnit.key) ? (
              <div key={timeUnit.key} className={block.elm('cell')}>
                <div>
                  {time[timeUnit.key]} <span className={block.elm('unit')}>{timeUnit.shortName}</span>
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div className={block}>
          {TIME_UNITS.map((timeUnit) =>
            this.showTimeUnit(timeUnit.key) ? (
              <div key={timeUnit.key} className={block.elm('cell')}>
                <div>{time[timeUnit.key]}</div>
                <div>{timeUnit.longName}</div>
              </div>
            ) : null
          )}
        </div>
      )
    ) : (
      <div className={block} style={customStyle.body}>
        {TIME_UNITS.map((timeUnit) =>
          this.showTimeUnit(timeUnit.key) ? (
            <div key={timeUnit.key} className={block.elm('cell')}>
              <div style={customStyle.bodySize}>{time[timeUnit.key]}</div>
              <div style={customStyle.cell}>{timeUnit.longName}</div>
            </div>
          ) : null
        )}
      </div>
    );
  }
}
