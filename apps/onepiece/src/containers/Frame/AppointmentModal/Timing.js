import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import Calendar from 'components/Calendar';
import ReactSVG from 'components/ReactSVG';
import Slick from 'react-slick';
import classNames from 'classnames';
import Spinner from 'components/Spinner';
import { getDate } from 'utils/time';
import { getUserDevice } from 'utils/device';
import style from './style.scss';

const device = getUserDevice() || 'desktop';
const PrevBtn = ({ currentSlide, slideCount, ...rest }) => (
  <button {...rest} type="button" aria-label="Show Previous">
    <ReactSVG name="arrow-prev" />
  </button>
);
const NextBtn = ({ currentSlide, slideCount, ...rest }) => (
  <button {...rest} type="button" aria-label="Show Next">
    <ReactSVG name="arrow-next" />
  </button>
);

export default class Timing extends Component {
  static propTypes = {
    type: PropTypes.string,
    eventId: PropTypes.number.isRequired,
    days: PropTypes.number,
    title: PropTypes.bool,
    date: PropTypes.string,
    showCertainDay: PropTypes.bool,
  };

  static contextTypes = {
    goToStep: PropTypes.func,
    setSlot: PropTypes.func,
  };

  static defaultProps = {
    days: 28,
  };

  state = {
    loading: true,
    days: [], // days store slots in each day
    chosenDay: getDate(),
    intervals: {
      morning: {
        name: 'morning',
        icon: <ReactSVG name="sunrise" />,
        available_slots: 0,
        slots: [],
      },
      afternoon: {
        name: 'afternoon',
        icon: <ReactSVG name="sun" />,
        available_slots: 0,
        slots: [],
      },
      evening: {
        name: 'evening',
        icon: <ReactSVG name="moon" />,
        available_slots: 0,
        slots: [],
      },
    },
    shownIntervalIndex: -1,
  };

  UNSAFE_componentWillMount() {
    const { eventId, days, date, showCertainDay } = this.props;

    const options = {
      event_id: eventId,
      days,
    };

    if (date) {
      options.date = date;
    }

    this.client
      .get('/appointments/availability', {
        params: options,
      })
      .then((results) => {
        this.setState({
          loading: false,
          days: showCertainDay ? results.filter((i) => i?.slots?.length > 0) : results,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.days !== this.state.days || !getDate(prevState.chosenDay).isSame(this.state.chosenDay, 'day')) {
      this.setIntervals();
    }
  }

  client = new ApiClient();

  dayPerWeek = device !== 'desktop' ? 3 : 7;

  isRSVP = this.props.type === 'rsvp';

  setIntervals() {
    const chosenDayFromDays = this.state.days.find((day) => getDate(day.date).isSame(this.state.chosenDay, 'day'));

    if (chosenDayFromDays) {
      const morning = {
        slots: [],
        available_slots: 0,
      };
      const afternoon = {
        slots: [],
        available_slots: 0,
      };
      const evening = {
        slots: [],
        available_slots: 0,
      };

      const { slots } = chosenDayFromDays;

      slots.forEach((slot) => {
        const hour = getDate(slot.appointed_on).hour();
        if (hour < 12) {
          morning.slots.push(slot);
          morning.available_slots += +!slot.slot_full;
        } else if (hour < 18) {
          afternoon.slots.push(slot);
          afternoon.available_slots += +!slot.slot_full;
        } else {
          evening.slots.push(slot);
          evening.available_slots += +!slot.slot_full;
        }
      });

      this.setState((state) => ({
        intervals: {
          morning: {
            ...state.intervals.morning,
            ...morning,
          },
          afternoon: {
            ...state.intervals.afternoon,
            ...afternoon,
          },
          evening: {
            ...state.intervals.evening,
            ...evening,
          },
        },
        shownIntervalIndex: -1,
      }));
    }
  }

  chooseDay = (day) => {
    this.setState(
      {
        chosenDay: day,
      },
      () => {
        if (this.isRSVP) {
          const chosenDayFromDays = this.state.days.find((day) =>
            getDate(day.date).isSame(this.state.chosenDay, 'day')
          );
          const { appointed_on } = chosenDayFromDays.slots[0];
          this.selectSlot(appointed_on);
        }
      }
    );
  };

  chooseInterval(index) {
    this.setState({
      shownIntervalIndex: index,
    });
  }

  onSelectCalendar = (day) => {
    if (!getDate(day).isSame(this.state.chosenDay, 'day')) {
      // get the index of new chosen day
      const index = this.state.days.findIndex((d) => getDate(d.date).isSame(day, 'day'));

      if (index > -1) {
        this.slick.slickGoTo(parseInt(index / this.dayPerWeek));
      }

      this.setState({
        chosenDay: day,
      });
    }
  };

  selectSlot = (id, appointedOn) => {
    this.context.setSlot(id, appointedOn);
    this.context.goToStep('info');
  };

  dispalyAvailability(slots, available_slots) {
    if (slots.length === 0) {
      return 'No Slots';
    }
    if (available_slots === 0) {
      return 'Fully Booked';
    }
    return `${available_slots} Avail`;
  }

  render() {
    const { loading, days, chosenDay, intervals, shownIntervalIndex } = this.state;
    const { showCertainDay, title } = this.props;

    const _chosenDay = days.find((day) => getDate(day.date).isSame(chosenDay, 'day'));

    // split total days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += this.dayPerWeek) {
      weeks.push(days.slice(i, i + this.dayPerWeek));
    }

    const availableDays = days.map((i) => i.date);

    return (
      <div className={style.timing}>
        {title && <div className={style.header}>Choose Timing</div>}

        {this.props.days > 7 && (
          <div className={`${style.timing}__calendar`}>
            <Calendar
              lapse={this.props.days}
              selectedDay={chosenDay}
              onConfirmDate={this.onSelectCalendar}
              disabledDays={
                showCertainDay ? (day) => !availableDays.some((item) => getDate(day).isSame(item, 'day')) : null
              }
            />
          </div>
        )}
        {loading ? (
          <div className={`${style.timing}__loading`}>
            <Spinner />
          </div>
        ) : (
          <div className={`${style.timing}__date`}>
            <Slick
              ref={(c) => (this.slick = c)}
              infinite={false}
              draggable={false}
              speed={500}
              arrows
              prevArrow={<PrevBtn />}
              nextArrow={<NextBtn />}
            >
              {weeks.map((week, index) => (
                <div key={index}>
                  <div className={`${style.timing}__week`}>
                    {week.map((day) => {
                      const date = getDate(day.date);

                      return (
                        <div
                          key={day.date}
                          style={{ width: `${100 / this.dayPerWeek}%` }}
                          className={classNames(`${style.timing}__week__day`, {
                            'is-selected': date.isSame(chosenDay, 'day'),
                          })}
                        >
                          <button
                            className="btn"
                            disabled={day.slots.length === 0 || day.total_available_slots === 0}
                            onClick={() => this.chooseDay(date.toDate())}
                            type="button"
                          >
                            <div>{date.isSame(getDate(), 'day') ? 'Today' : date.format('ddd')}</div>
                            <div>{date.format('D')}</div>
                            {this.isRSVP && <div className={`${style.timing}__rsvp-time`}>10am - 6pm</div>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Slick>
            {_chosenDay && _chosenDay.slots.length > 0 && (
              <div className={`${style.timing}__slots__wrapper`}>
                {Object.keys(intervals).map((key, index) => {
                  const interval = intervals[key];

                  if (index === shownIntervalIndex) {
                    return (
                      <div key={index} className={`${style.timing}__slots__container`}>
                        <div className={`${style.timing}__slots`}>
                          {interval.slots.map((slot, index1) => (
                            <div key={index1} className={`${style.timing}__slot`}>
                              <button
                                onClick={() => this.selectSlot(slot.id, slot.appointed_on)}
                                key={index1}
                                disabled={slot.slot_full}
                                type="button"
                                className="btn"
                              >
                                {getDate(slot.appointed_on).format('h:mm a')} -{' '}
                                {getDate(slot.appointed_off).format('h:mm a')}
                                <div className={`${style.timing}__slot__availableNum`}>
                                  {!slot.slot_full &&
                                    ` (${slot.available_slots_count} spot${
                                      slot.available_slots_count > 1 ? 's' : ''
                                    } left)`}
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  const disabled = interval.slots.length === 0 || interval.available_slots === 0;

                  return (
                    <div key={index} className={`${style.timing}__slots__container`}>
                      <div
                        onClick={disabled ? null : () => this.chooseInterval(index)}
                        key={index}
                        className={classNames(`${style.timing}__slots__mask`, {
                          'is-disabled': disabled,
                        })}
                      >
                        {interval.icon}
                        <p>{interval.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
