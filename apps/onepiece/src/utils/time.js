import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import minMax from 'dayjs/plugin/minMax';
import isBetween from 'dayjs/plugin/isBetween';
import { fcBusinessHours } from '../config';

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(duration);
dayjs.extend(minMax);
dayjs.extend(isBetween);

export function getDate(date, timezone = __TIME_ZONE__, isChangeTime = false) {
  if (date) {
    return dayjs(date).tz(timezone, isChangeTime);
  }
  return dayjs().tz(timezone, isChangeTime);
}

export function getMaxDate(arr) {
  return dayjs.max(arr);
}

export function getDuration(diff) {
  return dayjs.duration(diff);
}

export function getTimestamp() {
  const nowDate = getDate();
  return dayjs(nowDate).unix();
}

export function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}

export function formatTime(date) {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

export function daysToDate(date) {
  const givenDate = dayjs(date);
  const nowDate = dayjs();
  const diff = givenDate.diff(nowDate, 'days');
  if (diff > 0) {
    return diff;
  }
  return 0;
}

export function daysBetweenStartToEnd(start, end) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const diff = endDate.diff(startDate, 'days');
  if (diff > 0) {
    return diff;
  }
  return 0;
}

export function calculateBufferDaysExcludingWeekends(start, end) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const bufferDays = endDate.diff(start, 'day');
  let weekendDays = 0;
  let currentDate = startDate;

  for (let i = 0; i <= bufferDays; i++) {
    if (currentDate.day() === 6 || currentDate.day() === 0) {
      weekendDays++;
    }
    currentDate = currentDate.add(1, 'day');
  }

  return bufferDays - weekendDays;
}

export function isExpired(date) {
  return dayjs().isAfter(date);
}

export function isBefore(date) {
  const nowDate = getDate();
  const startDate = dayjs(date).tz(__TIME_ZONE__, true);
  return nowDate.isBefore(startDate);
}

export function isOutdated(start, end) {
  const nowDate = getDate();
  if (start && end) {
    const startDate = dayjs(start).tz(__TIME_ZONE__, true);
    const endDate = dayjs(end).tz(__TIME_ZONE__, true);
    return !nowDate.isBetween(startDate, endDate);
  }
  if (start) {
    const startDate = dayjs(start).tz(__TIME_ZONE__, true);
    return nowDate.isBefore(startDate);
  }
  if (end) {
    const endDate = dayjs(end).tz(__TIME_ZONE__, true);
    return nowDate.isAfter(endDate);
  }
  return false;
}

export function isBusinessHours() {
  const nowDate = dayjs();
  const fmt = 'hh:mm A';
  const isWeekdays = nowDate.day() < 6;
  const businessHour = fcBusinessHours[isWeekdays ? 'Weekdays' : 'Weekends'];
  if (businessHour) {
    const start = dayjs(businessHour.from).format(fmt);
    const end = dayjs(businessHour.to).format(fmt);
    return nowDate.isBetween(start, end);
  }
  return false;
}

export function getDateAbbr(date) {
  const nowDate = new Date(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = nowDate.getMonth();
  const monthName = monthNames[monthIndex];

  const day = nowDate.getDate();
  const year = nowDate.getFullYear();

  return `${monthName} ${`0${day}`.slice(-2)}, ${year}`;
}
