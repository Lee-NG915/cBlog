import { EcEnv } from '@castlery/config';
import moment from 'moment-timezone';

const __TIME_ZONE__ = EcEnv.NEXT_PUBLIC_TIME_ZONE as string;

export const getDate = (date?: string, timezone = __TIME_ZONE__) => {
  if (date) {
    return moment.tz(date, timezone);
  }
  return moment.tz(timezone);
};

export const isOutdated = (start?: string, end?: string) => {
  const nowDate = getDate();
  if (!end && !start) {
    return false;
  }
  // if (!end || !start) {
  //   return false;
  // }
  if (start && end) {
    const startDate = moment.tz(start, __TIME_ZONE__);
    const endDate = moment.tz(end, __TIME_ZONE__);
    return !nowDate.isBetween(startDate, endDate);
  }
  if (start) {
    const startDate = moment.tz(start, __TIME_ZONE__);
    return nowDate.isBefore(startDate);
  }
  if (end) {
    const endDate = moment.tz(end, __TIME_ZONE__);
    return nowDate.isAfter(endDate);
  }
  return false;
};

export function getTimestamp() {
  const nowDate = getDate();
  return moment(nowDate).unix();
}

/**
 * Calculate the number of days between a given date and now
 * @param date - The target date string
 * @param timezone - Optional timezone, defaults to __TIME_ZONE__
 * @returns Number of days from now to the given date, 0 if date is in the past
 */
export function daysToDate(date: string, timezone = __TIME_ZONE__): number {
  const givenDate = moment.tz(date, timezone);
  const nowDate = getDate();
  const diff = givenDate.diff(nowDate, 'days');

  if (diff > 0) {
    return diff;
  }
  return 0;
}
