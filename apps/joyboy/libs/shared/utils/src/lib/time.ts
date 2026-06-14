import { EcEnv } from '@castlery/config';
import moment from 'moment-timezone';
import { formatDate } from './time.util';

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
