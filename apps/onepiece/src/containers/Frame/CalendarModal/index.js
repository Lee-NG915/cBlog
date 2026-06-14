import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import { GhostArrowBtn, CloseBtn } from 'components/Button';
import { ternaryExpressions } from 'utils/ternaryExpression';
import { getDate } from 'utils/time';
import { Typography } from '@castlery/fortress';
import style from './style.scss';

const CalendarModal = (
  {
    minDate,
    maxDate,
    selectedDate: passedDate,
    onDaySelect,
    isSingle,
    isFromDamco,
    defaultEstimatedDate,
    disabledDays,
    bufferDays,
    leastBufferDays,
    title = 'Schedule Your Delivery',
    description = 'Delivery date confirmation is subject to the availability of our delivery partners. We will send out an SMS and Email with a delivery link closer to your chosen dates for you to select the actual delivery date and timeslot.',
  },
  { frame }
) => {
  const [selectedDate, setSelectedDate] = useState(getDate(passedDate).toDate());

  const onDayClick = (date) => {
    setSelectedDate(date);
  };

  const closeModal = (e) => {
    if (e.target.classList.contains(style.modal)) {
      frame.removeModal();
    }
  };

  const calculateBufferDaysWithWeekends = (startDate, bufferDays) => {
    let additionalDays = 0;

    for (let i = 0; i < bufferDays + additionalDays; i++) {
      const currentDay = startDate.add(i, 'day').day();
      if (currentDay === 6 || currentDay === 0) {
        // 6 is Saturday, 0 is Sunday
        additionalDays += 1;
      }
    }

    if (startDate.add(bufferDays + additionalDays, 'day').day() === 6) {
      additionalDays += 2;
    }

    // if (leastBufferDays) {
    //   return leastBufferDays > bufferDays + additionalDays ? leastBufferDays : bufferDays + additionalDays;
    // }

    return bufferDays + additionalDays;
  };

  const defaultDate = getDate(defaultEstimatedDate).toDate();

  return (
    <div role="menuitem" onClick={closeModal} className={style.modal}>
      <div className={`${style.modal}__container`}>
        <div className={`${style.modal}__main`}>
          <div className={`${style.modal}__header`}>
            <Typography level="h3">{title}</Typography>
            <Typography level="body2">{description}</Typography>

            <CloseBtn
              className={`${style.modal}__close is-calendar`}
              onClick={() => frame.removeModal()}
              width="16px"
              height="16px"
            />
          </div>

          <DayPicker
            initialMonth={getDate(selectedDate).toDate()}
            fromMonth={defaultDate}
            selectedDays={{
              from: getDate(selectedDate).toDate(),
              to: ternaryExpressions(
                isSingle,
                getDate(selectedDate).toDate(),
                isFromDamco && getDate(selectedDate).isSame(minDate, 'day')
                  ? getDate(selectedDate).toDate()
                  : getDate(selectedDate)
                      .add(calculateBufferDaysWithWeekends(getDate(selectedDate), bufferDays || 6), 'd')
                      .toDate()
              ),
            }}
            disabledDays={[
              (day) => {
                if (getDate(day).isSame(defaultDate, 'day')) {
                  return false;
                }
                if (getDate(day).isAfter(getDate(maxDate), 'day')) {
                  return true;
                }
                if (isFromDamco) {
                  // choose another date that is 5 days later after minDate
                  return getDate(day).isBefore(getDate(minDate).add(5, 'd'), 'day');
                }
                return getDate(day).isBefore(minDate, 'day');
              },
              (day) => {
                if (disabledDays && Array.isArray(disabledDays)) {
                  return disabledDays.some((disabledDay) => {
                    if (disabledDay.from && disabledDay.to) {
                      return getDate(day).isBetween(disabledDay.from, disabledDay.to, 'day', '[]');
                    }
                    return getDate(day).isSame(disabledDay, 'day');
                  });
                }
              },
            ]}
            weekdaysShort={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
            onDayClick={(date) => onDayClick(date)}
            showOutsideDays
          />
        </div>

        <div className={`${style.modal}__btn`}>
          <GhostArrowBtn
            className="btn"
            backgroundcolor="transparent"
            onClick={() => onDaySelect(selectedDate)}
            text="Confirm"
            hasArrow={false}
          />
        </div>
      </div>
    </div>
  );
};

CalendarModal.animation = 'plain';

CalendarModal.propTypes = {
  title: PropTypes.string,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  selectedDate: PropTypes.string,
  onDaySelect: PropTypes.func,
  isSingle: PropTypes.bool,
  isFromDamco: PropTypes.bool,
  defaultEstimatedDate: PropTypes.string,
  disabledDays: PropTypes.array, // [ new Date(2022, 5, 10), new Date(2022, 5, 12),{ from: new Date(2022, 4, 18), to: new Date(2022, 4, 29) }]
  description: PropTypes.string,
};

CalendarModal.contextTypes = {
  frame: PropTypes.object,
};

export default CalendarModal;
