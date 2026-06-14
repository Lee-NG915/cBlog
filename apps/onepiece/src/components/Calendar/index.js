import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import DayPicker from 'react-day-picker';
import ReactSVG from 'components/ReactSVG';
import { getDate } from 'utils/time';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@withUseBreakpoints
export default class Calendar extends Component {
  static propTypes = {
    className: PropTypes.string,
    onConfirmDate: PropTypes.func,
    selectedDay: PropTypes.object,
    lapse: PropTypes.number, // number of days last
    disabledDays: PropTypes.func,
    breakpoints: PropTypes.object,
  };

  static defaultProps = {
    selectedDay: getDate(),
  };

  constructor(props) {
    super(props);

    this.state = {
      isCalendarShow: false,
      value: this.formatDate(props.selectedDay),
      selectedDay: props.selectedDay,
    };
  }

  componentDidMount() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    this.handleDismissClick = this.handleDismissClick.bind(this);
    const event = !desktop ? 'touchstart' : 'click';
    document.addEventListener(event, this.handleDismissClick);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { selectedDay } = this.props;
    if (getDate(nextProps.selectedDay).isSame(selectedDay, 'day')) {
      this.setState({
        value: this.formatDate(nextProps.selectedDay),
        selectedDay: nextProps.selectedDay,
      });
    }
  }

  componentWillUnmount() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    const event = !desktop ? 'touchstart' : 'click';
    document.removeEventListener(event, this.handleDismissClick);
  }

  formatDate = (day) => getDate(day).format('DD/MM/YYYY');

  handleDismissClick = (e) => {
    const { isCalendarShow } = this.state;
    if (isCalendarShow) {
      let { target } = e;
      while (target && !target.classList.contains(style.calendar) && target.tagName !== 'BODY') {
        target = target.parentNode;
      }
      if (target && target.tagName === 'BODY') {
        this.hideCalendar();
      }
    }
  };

  handleInputChange = (e) => {
    const { selectedDay } = this.state;
    const { value } = e.target;
    const numberArr = value.split('/');
    const date = new Date(numberArr[2], +numberArr[1] - 1, numberArr[0]);

    if (date.getTime()) {
      this.setState(
        {
          selectedDay: date,
          value,
        },
        () => {
          this.daypicker?.showMonth(selectedDay);
        }
      );
    } else {
      this.setState({
        selectedDay: null,
        value,
      });
    }
  };

  handleInputFocus = () => {
    this.setState({
      isCalendarShow: true,
    });
    // blur input if on mobile
    this.input.blur();
  };

  handleDayClick = (day) => {
    this.setState({
      selectedDay: day,
      value: this.formatDate(day),
    });

    this.hideCalendar();

    const { onConfirmDate } = this.props;
    if (onConfirmDate) {
      onConfirmDate(day);
    }
  };

  onSubmit = (e) => {
    const { selectedDay } = this.state;
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (!desktop) {
      this.input.blur();
    }

    e.preventDefault();

    if (selectedDay) {
      this.hideCalendar();

      const { onConfirmDate } = this.props;
      if (onConfirmDate) {
        onConfirmDate(selectedDay);
      }
    }
  };

  hideCalendar = () => {
    this.setState({
      isCalendarShow: false,
    });
    this.input.blur();
  };

  render() {
    const { className, lapse, disabledDays, breakpoints = {} } = this.props;
    const { isCalendarShow, value, selectedDay } = this.state;
    const { desktop } = breakpoints;
    const today = getDate();

    const options = {};
    if (lapse) {
      const lastDay = getDate().add(lapse, 'day');
      options.toMonth = lastDay.toDate();
      options.disabledDays = (day) => !getDate(day).isBetween(today.subtract(1, 'day'), lastDay, 'day');
    } else {
      options.disabledDays = (day) => getDate(day).isBefore(today, 'day');
    }
    if (disabledDays) {
      options.disabledDays = disabledDays;
    }

    return (
      <form action="/" onSubmit={this.onSubmit} className={classNames(style.calendar, className)}>
        {/* to fix the autofocus in mobile */}
        {!desktop && <input type="hidden" />}
        <input
          ref={(c) => (this.input = c)}
          className="form-control"
          placeholder="DD/MM/YYYY"
          value={value}
          onChange={this.handleInputChange}
          onFocus={this.handleInputFocus}
          id="datepicker"
          type="text"
        />
        <label htmlFor="datepicker">
          <ReactSVG name="calendar" />
        </label>
        {isCalendarShow && (
          <DayPicker
            ref={(c) => (this.daypicker = c)}
            selectedDays={(day) => getDate(selectedDay).isSame(day, 'day')}
            fromMonth={getDate().toDate()}
            onDayClick={(day) => this.handleDayClick(day)}
            weekdaysShort={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
            {...options}
          />
        )}
      </form>
    );
  }
}
